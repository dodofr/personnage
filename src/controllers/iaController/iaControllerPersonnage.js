const { OpenAI } = require("openai");
const {
  Personnage,
  Attribut,
  Image,
  Planete,
  Vehicule,
  Faction,
  Pouvoir,
  Groupe,
  Equipement
} = require("../../db/sequelize");

const {
  obtenirPersonnageParId,
  creerPersonnage,
  mettreAJourPersonnage,
  supprimerPersonnage
} = require("../personnageController");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let sessions = {};

// Petit helper debug
function debug(...args) {
  if (process.env.DEBUG_IA === "true") {
    console.log("[IA DEBUG]", ...args);
  }
}

// Harmoniser les données reçues de l'IA pour le CRUD
function harmoniserDataIA(data) {

  const toObjectList = (arr, type) => {
    if (!arr) return [];

    return arr.map(item => {
      if (typeof item === "string") {
        return {
          nom: item,
          descriptif: `Aucun descriptif fourni pour ${type} "${item}".`
        };
      }

      return {
        nom: item.nom || "Inconnu",
        descriptif: item.descriptif || `Aucun descriptif fourni pour ${type} "${item.nom}".`
      };
    });
  };

  const stats = data.donnees?.stats || {
    intelligence: 50,
    force: 50,
    agilite: 50,
    endurance: 50,
    charisme: 50
  };

  const attributs = Array.isArray(data.donnees?.attributs)
    ? data.donnees.attributs.map(a => ({
        nom: a.nom || "Attribut",
        valeur: a.valeur || "Inconnu"
      }))
    : [];

  const planetes   = toObjectList(data.donnees?.planetes || [], "planète");
  const groupes    = toObjectList(data.donnees?.groupes || [], "groupe");
  const factions   = toObjectList(data.donnees?.affiliations || data.donnees?.factions || [], "faction");
  const pouvoirs   = toObjectList(data.donnees?.pouvoirs || [], "pouvoir");
  const vehicules  = toObjectList(data.donnees?.vehicules || [], "véhicule");
  const equipements= toObjectList(data.donnees?.equipements || [], "équipement");

  return {
    nom: data.nomPersonnage || "SansNom",
    descriptif: data.donnees?.description || "Aucune description fournie.",
    stats: JSON.stringify(stats),
    planetes: JSON.stringify(planetes),
    groupes: JSON.stringify(groupes),
    factions: JSON.stringify(factions),
    pouvoirs: JSON.stringify(pouvoirs),
    vehicules: JSON.stringify(vehicules),
    equipements: JSON.stringify(equipements),
    attributs: JSON.stringify(attributs)
  };
}

exports.iaHistorique = (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ message: "Session introuvable." });
  }
  res.json(sessions[sessionId].historique);
};

exports.iaConversationPersonnage = async (req, res) => {
  try {
    debug("=== Nouvelle requête IA ===");
    debug("Body reçu :", req.body);

    const sessionId = req.body.sessionId;
    const prompt = req.body.message || req.body.prompt;

    if (!sessionId) return res.status(400).json({ message: "sessionId manquant" });
    if (!prompt) return res.status(400).json({ message: "Message manquant" });

    if (!sessions[sessionId]) sessions[sessionId] = { personnageId: null, historique: [] };
    const session = sessions[sessionId];
    debug("Session récupérée :", sessionId, session);

    const userMessage = { role: "user", content: prompt };

    const systemPrompt = `
Tu es une IA Star Wars spécialisée.  
Tu dois TOUJOURS répondre avec un JSON STRICT, sans aucun texte avant ou après.

FORMAT JSON ATTENDU :
{
  "action": "creer | modifier | ajouter_relation | retirer_relation | changer_champ | supprimer | chercher",
  "nomPersonnage": "",
  "champ": "",
  "valeur": "",
  "relationType": "",
  "items": [],
  "donnees": {
    "description": "",
    "stats": {
      "intelligence": 0,
      "force": 0,
      "agilite": 0,
      "endurance": 0,
      "charisme": 0
    },
    "attributs": [],
    "planetes": [],
    "groupes": [],
    "factions": [],
    "pouvoirs": [],
    "vehicules": [],
    "equipements": []
  }
}

RÈGLES GÉNÉRALES :
1. **STRICTEMENT JSON** → aucune phrase en dehors du JSON.
2. Tous les champs doivent exister même si l'utilisateur ne les mentionne pas.
3. Tous les tableaux doivent contenir des données pertinentes (min 1 élément).

SI "action" = "creer" :
- Tu dois produire un personnage COMPLET basé sur l'univers Star Wars.
- REMPLIR AUTOMATIQUEMENT :
  - description : paragraphe détaillé
  - planetes : au moins 1 objet { nom, descriptif }
  - groupes : au moins 1 objet { nom, descriptif }
  - factions : au moins 1 objet { nom, descriptif }
  - pouvoirs : au moins 1 objet { nom, descriptif }
  - vehicules : si logique, sinon un véhicule générique crédible
  - equipements : au moins 1 équipement cohérent { nom, descriptif }
  - attributs dynamiques : AU MOINS 2 objets { nom, valeur }
  - stats : 5 valeurs entières entre 0 et 100 (toujours présentes)

RÈGLE IMPORTANTE :
- Chaque élément dans planetes, groupes, factions, pouvoirs, vehicules, equipements
  doit être sous la forme :
  { "nom": "NomDeLEntité", "descriptif": "Description courte et cohérente" }

- Les attributs doivent être sous la forme :
  { "nom": "NomAttrib", "valeur": "ValeurAttrib" }

SI "action" ≠ "creer":
- Fournir UNIQUEMENT les champs utiles selon l’action.
- Ne jamais inventer un format différent.

RESPECT ABSOLU DU FORMAT JSON.
`;

    debug("Envoi de la requête à OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        ...session.historique,
        userMessage
      ]
    });

    let data;
    try {
      const content = completion.choices[0].message.content;
      debug("Réponse brute OpenAI :", content);
      data = JSON.parse(content);
    } catch (err) {
      console.error("Erreur parsing JSON OpenAI :", err);
      return res.status(500).json({ message: "Impossible de parser la réponse IA." });
    }

    debug("Data parsée :", JSON.stringify(data, null, 2));

    session.historique.push(userMessage);
    session.historique.push({ role: "assistant", content: JSON.stringify(data) });

    let personnage = null;
    if (data.nomPersonnage) {
      personnage = await Personnage.findOne({ where: { nom: data.nomPersonnage } });
      if (personnage) session.personnageId = personnage.id;
    }
    if (!personnage && session.personnageId) personnage = await Personnage.findByPk(session.personnageId);
    if (!personnage && data.action !== "creer")
      return res.status(404).json({ message: "Aucun personnage trouvé." });

    debug("Action détectée :", data.action);

    switch (data.action) {
      case "creer":
        req.body = harmoniserDataIA(data);
        req.files = {};
        debug("Body final pour création :", req.body);
        return creerPersonnage(req, res);

      case "supprimer":
        req.params.id = personnage.id;
        const resp = await supprimerPersonnage(req, res);
        session.personnageId = null;
        return resp;
      case "chercher":
        if (!personnage) return res.status(404).json({ message: "Personnage introuvable" });
        // Inclure toutes les relations et attributs
        const persoComplet = await Personnage.findByPk(personnage.id, {
          include: [
           { model: Attribut, where: { entiteType: 'Personnage' }, required: false },
           { model: Image, as: 'images', required: false },
           Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement
      ]
    });
    return res.status(200).json(persoComplet);
      case "changer_champ":
      case "ajouter_relation":
      case "retirer_relation":
        req.params.id = personnage.id;
        const fullPerso = await Personnage.findByPk(personnage.id, {
          include: [Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement, { model: Attribut }]
        });

        const base = {
          nom: fullPerso.nom,
          descriptif: fullPerso.descriptif,
          stats: fullPerso.stats,
          planetes: fullPerso.Planetes.map(x => x.nom),
          vehicules: fullPerso.Vehicules.map(x => x.nom),
          factions: fullPerso.Factions.map(x => x.nom),
          pouvoirs: fullPerso.Pouvoirs.map(x => x.nom),
          groupes: fullPerso.Groupes.map(x => x.nom),
          equipements: fullPerso.Equipements.map(x => x.nom),
          attributs: fullPerso.Attributs.map(a => ({ nom: a.nom, valeur: a.valeur }))
        };

        if (data.action === "changer_champ") {
          base[data.champ] = data.valeur;
        } else {
          let arr = base[data.relationType] || [];
          arr = data.action === "ajouter_relation"
            ? Array.from(new Set([...arr, ...data.items]))
            : arr.filter(x => !data.items.includes(x));
          base[data.relationType] = arr;
        }

        req.body = base;
        req.files = {};
        debug("Body final pour update :", req.body);
        return mettreAJourPersonnage(req, res);

      default:
        return res.status(400).json({ message: "Action inconnue." });
    }

  } catch (e) {
    console.error("Erreur IA :", e);
    res.status(500).json({ message: e.message });
  }
};
