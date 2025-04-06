const upload = require('../upload/upload');

const {
    creerPlanete,
    obtenirToutesLesPlanetes,
    obtenirPlaneteParId,
    mettreAJourPlanete,
    supprimerPlanete
} = require('../controllers/planeteController');

module.exports = (app) => {
    app.post("/api/planetes",
        upload.array('images', 10),
        creerPlanete
    );

    app.get('/api/planetes', obtenirToutesLesPlanetes);
    app.get('/api/planetes/:id', obtenirPlaneteParId);

    app.put('/api/planetes/:id',
        upload.array('images', 10),
        mettreAJourPlanete
    );

    app.delete('/api/planetes/:id', supprimerPlanete);
};
