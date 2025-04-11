const upload = require('../upload/upload');

const {
    creerPersonnage,
    obtenirTousLesPersonnages,
    obtenirPersonnageParId,
    mettreAJourPersonnage,
    supprimerPersonnage
} = require('../controllers/personnageController');

module.exports = (app) => {
    app.post("/api/personnages",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]), creerPersonnage
    );

    app.get('/api/personnages', obtenirTousLesPersonnages);

    app.get('/api/personnages/:id', obtenirPersonnageParId);

    app.put("/api/personnages/:id",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]), mettreAJourPersonnage
    );

    app.delete('/api/personnages/:id', supprimerPersonnage);
};
