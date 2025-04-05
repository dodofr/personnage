const {
    creerCarte,
    obtenirToutesLesCartes,
    obtenirCarteParId,
    mettreAJourCarte,
    supprimerCarte
} = require("../controllers/carteController");

module.exports = (app) => {
    // Créer une carte
    app.post("/api/cartes", creerCarte);

    // Obtenir toutes les cartes
    app.get("/api/cartes", obtenirToutesLesCartes);

    // Obtenir une carte par ID
    app.get("/api/cartes/:id", obtenirCarteParId);

    // Mettre à jour une carte
    app.put("/api/cartes/:id", mettreAJourCarte);

    // Supprimer une carte
    app.delete("/api/cartes/:id", supprimerCarte);
};
