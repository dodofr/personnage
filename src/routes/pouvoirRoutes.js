const upload = require('../upload/upload');

const {
    creerPouvoir,
    obtenirTousLesPouvoirs,
    obtenirPouvoirParId,
    mettreAJourPouvoir,
    supprimerPouvoir
} = require('../controllers/pouvoirController');

module.exports = (app) => {
    app.post("/api/pouvoirs",
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),
        creerPouvoir
    );

    app.get('/api/pouvoirs', obtenirTousLesPouvoirs);
    app.get('/api/pouvoirs/:id', obtenirPouvoirParId);

    app.put('/api/pouvoirs/:id',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),
        mettreAJourPouvoir
    );

    app.delete('/api/pouvoirs/:id', supprimerPouvoir);
};
