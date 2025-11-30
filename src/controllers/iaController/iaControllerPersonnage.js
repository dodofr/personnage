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

// Harmoniser les données reçues de l'IA pour le CRUD
function harmoniserDataIA(data) {
  // Stats par défaut
  const stats = data.donnees?.stats || {
    intelligence: 50,
    force: 50,
    agilite: 50,
    endurance: 50,
    charisme: 50
  };

  // Attributs dynamiques
  let attributs = [];
  if (Array.isArray(data.items) && data.items.length > 0) {
    attributs = data.items
      .map(a =>
        typeof a === "string" ? { nom: a, valeur: "Inconnu" } :
        a.nom && a.valeur ? { nom: a.nom, valeur: a.valeur } :
        null
      )
      .filter(a => a !== null);
  } else if (Array.isArray(data.donnees?.attributs)) {
    attributs = data.donnees.attributs
      .map(a => (a.nom && a.valeur ? { nom: a.nom, valeur: a.valeur } : null))
      .filter(a => a !== null);
  }

  // Groupes
  const groupes = Array.isArray(data.donnees?.groupes) ? data.donnees.groupes : [];

  // Factions / affiliations
  const affiliations = data.donnees?.affiliations || data.donnees?.factions || [];
  const factions = Array.isArray(affiliations) ? affiliations : affiliations.split(";").map(s => s.trim());

  // Planètes
  const planetes = data.donnees?.planetes
    ? Array.isArray(data.donnees.planetes)
      ? data.donnees.planetes
      : [data.donnees.planetes]
    : data.donnees?.planete_origine
      ? [data.donnees.planete_origine]
      : [];

  // Équipements, véhicules, pouvoirs
  const equipements = Array.isArray(data.donnees?.equipements) ? data.donnees.equipements : [];
  const vehicules = Array.isArray(data.donnees?.vehicules) ? data.donnees.vehicules : [];
  const pouvoirs = Array.isArray(data.donnees?.pouvoirs) ? data.donnees.pouvoirs : [];

  return {
    nom: data.nomPersonnage || "SansNom",
    descriptif: data.donnees?.description || "",
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

exports.iaConversationPersonnage = async (req, res) => {
  try {
    console.log("=== Nouvelle requête IA ===");
    console.log("Body reçu :", req.body);

    const sessionId = req.body.sessionId;
    const prompt = req.body.message || req.body.prompt;

    if (!sessionId) return res.status(400).json({ message: "sessionId manquant" });
    if (!prompt) return res.status(400).json({ message: "Message manquant" });

    if (!sessions[sessionId]) sessions[sessionId] = { personnageId: null, historique: [] };
    const session = sessions[sessionId];
    console.log("Session récupérée :", sessionId, session);

    const userMessage = { role: "user", content: prompt };

    const systemPrompt = `
Tu es une IA Star Wars spécialisée. Tu dois toujours répondre uniquement avec un JSON STRICT.

JSON attendu :
{
  "action": "creer | modifier | ajouter_relation | retirer_relation | changer_champ | supprimer",
  "nomPersonnage": "",
  "champ": "",
  "valeur": "",
  "relationType": "",
  "items": [],
  "donnees": {}
}

Instructions :
1. Si l'utilisateur demande de créer un personnage ("action": "creer") :
   - REMPLIR AUTOMATIQUEMENT TOUS LES CHAMPS :
     - description : texte détaillé sur le personnage
     - planetes : planète d'origine
     - groupes : grand ensemble politique ou militaire (ex: République)
     - factions : sous-groupe (ex: 501ème Légion)
     - stats : valeurs "figées" (intelligence, force, agilite, endurance, charisme)
     - attributs : traits dynamiques (sens du devoir, tir de précision, initiative…)
     - pouvoirs : pouvoirs spéciaux (pouvoirs de la Force, capacités uniques)
     - vehicules : véhicule attitré si applicable
     - equipements : items de base (blaster, comlink, etc.)
   - Tous les champs doivent contenir des noms ou valeurs cohérents et pertinents.
   - Attributs dynamiques : au moins 2 objets {nom, valeur}.

2. STRICTEMENT JSON, aucun texte libre hors JSON.
3. Tous les tableaux doivent être remplis même si l'utilisateur n'en fournit pas.
`;

    console.log("Envoi de la requête à OpenAI...");
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
      data = JSON.parse(content);
    } catch (err) {
      console.error("Erreur parsing JSON OpenAI :", err, "Contenu :", completion.choices[0].message.content);
      return res.status(500).json({ message: "Impossible de parser la réponse IA." });
    }

    console.log("Data parsée :", data);

    session.historique.push(userMessage);
    session.historique.push({ role: "assistant", content: JSON.stringify(data) });

    let personnage = null;
    if (data.nomPersonnage) {
      personnage = await Personnage.findOne({ where: { nom: data.nomPersonnage } });
      if (personnage) session.personnageId = personnage.id;
    }
    if (!personnage && session.personnageId) personnage = await Personnage.findByPk(session.personnageId);
    if (!personnage && data.action !== "creer") return res.status(404).json({ message: "Aucun personnage trouvé." });

    console.log("Action à effectuer :", data.action);

    switch (data.action) {
      case "creer":
        req.body = harmoniserDataIA(data);
        req.files = {};
        return creerPersonnage(req, res);

      case "supprimer":
        req.params.id = personnage.id;
        const resp = await supprimerPersonnage(req, res);
        session.personnageId = null;
        return resp;

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
        return mettreAJourPersonnage(req, res);

      default:
        return res.status(400).json({ message: "Action inconnue." });
    }

  } catch (e) {
    console.error("Erreur IA :", e);
    res.status(500).json({ message: e.message });
  }
};
