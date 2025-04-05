const {
    creerCategorieTaille,
    obtenirToutesLesCategories,
    mettreAJourCategorieTaille,
    obtenirCategorieTailleParId,
    supprimerCategorieTaille
} = require("../controllers/categorieTailleController");

module.exports = (app) => {
    // Créer une catégorie de taille
    app.post("/api/categoriesTaille", creerCategorieTaille);

    // Obtenir toutes les catégories de taille
    app.get("/api/categorieTaille", obtenirToutesLesCategories);

    // Obtenir une catégorie de taille par ID
    app.get("/api/categorieTaille/:id", obtenirCategorieTailleParId);

    // Mettre à jour une catégorie de taille
    app.put("/api/categorieTaille/:id", mettreAJourCategorieTaille);

    // Supprimer une catégorie de taille
    app.delete("/api/categorieTaille/:id", supprimerCategorieTaille);
};
