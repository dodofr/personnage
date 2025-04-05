const upload = require('../upload/upload');
const {
    creerFaction,
    mettreAJourFaction,
    obtenirToutesLesFactions,
    obtenirFactionParId,
    supprimerFaction
} = require("../controllers/factionController");

module.exports = (app) => {
    // Créer une faction
    app.post("/api/factions", creerFaction);

    // Obtenir toutes les factions
    app.get("/api/factions", obtenirToutesLesFactions);

    // Obtenir une faction par ID
    app.get("/api/factions/:id", obtenirFactionParId);

    // Mettre à jour une faction
    app.put("/api/factions/:id", mettreAJourFaction);

    // Supprimer une faction
    app.delete("/api/factions/:id", supprimerFaction);
};
