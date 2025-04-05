const upload = require('../upload/upload');

const {
    creerEquipement,
    obtenirTousLesEquipements,
    obtenirEquipementParId,
    mettreAJourEquipement,
    supprimerEquipement
} = require('../controllers/equipementController');

module.exports = (app) => {
    // Route pour créer un équipement avec téléchargement de plusieurs images
    app.post("/api/equipements",
        upload.array('images', 10),
        creerEquipement
    );

    // Route pour obtenir tous les équipements
    app.get('/api/equipements', obtenirTousLesEquipements);

    // Route pour obtenir un équipement par ID
    app.get('/api/equipements/:id', obtenirEquipementParId);

    // Route pour mettre à jour un équipement avec téléchargement de plusieurs images
    app.put("/api/equipements/:id",
        upload.array('images', 10),
        mettreAJourEquipement
    );

    // Route pour supprimer un équipement
    app.delete('/api/equipements/:id', supprimerEquipement);
};
