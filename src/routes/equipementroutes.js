const upload = require('../upload/upload');

const {
    creerEquipement,
    obtenirTousLesEquipements,
    obtenirEquipementParId,
    mettreAJourEquipement,
    supprimerEquipement
} = require('../controllers/equipementController');

module.exports = (app) => {
    app.post("/api/equipements",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),creerEquipement
    );

    app.get('/api/equipements', obtenirTousLesEquipements);

    app.get('/api/equipements/:id', obtenirEquipementParId);

    app.put("/api/equipements/:id",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),mettreAJourEquipement
    );

    app.delete('/api/equipements/:id', supprimerEquipement);
};
