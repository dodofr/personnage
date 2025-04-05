const upload = require('../upload/upload');  // Importation du middleware multer

const {
    creerPersonnage,
    obtenirTousLesPersonnages,
    obtenirPersonnageParId,
    mettreAJourPersonnage,
    supprimerPersonnage
} = require('../controllers/personnageController');

module.exports = (app) => {
    // Route pour créer un personnage avec téléchargement de plusieurs fichiers images
    app.post("/api/personnages", 
        upload.array('images', 10), // accepter jusqu'à 10 images
        creerPersonnage
    );

    // Route pour obtenir tous les personnages
    app.get('/api/personnages', obtenirTousLesPersonnages);

    // Route pour obtenir un personnage par ID
    app.get('/api/personnages/:id', obtenirPersonnageParId);

    // Route pour mettre à jour un personnage avec téléchargement de plusieurs images
    app.put("/api/personnages/:id", 
        upload.array('images', 10),  // possibilité de télécharger plusieurs images
        mettreAJourPersonnage
    );

    // Route pour supprimer un personnage (les images seront supprimées dans le contrôleur)
    app.delete('/api/personnages/:id', supprimerPersonnage);
};
