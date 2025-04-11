const upload = require('../upload/upload');

const {
    creerPlanete,
    obtenirToutesLesPlanetes,
    obtenirPlaneteParId,
    mettreAJourPlanete,
    supprimerPlanete
} = require('../controllers/planeteController');

module.exports = (app) => {
    // Ajout d'une virgule après upload.fields() pour séparer les middlewares
    app.post("/api/planetes",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]), // ici la virgule
        creerPlanete // Ajout de la fonction `creerPlanete` après le middleware
    );

    app.get('/api/planetes', obtenirToutesLesPlanetes);
    app.get('/api/planetes/:id', obtenirPlaneteParId);

    app.put('/api/planetes/:id',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),mettreAJourPlanete
    );

    app.delete('/api/planetes/:id', supprimerPlanete);
};
