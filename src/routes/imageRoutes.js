const upload = require('../upload/upload');
const {
    ajouterImages,
    supprimerImage,
    listerImages,
    obtenirImageParId,
    mettreAJourImage
} = require('../controllers/imageController');

module.exports = (app) => {
    app.post('/api/images',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),
        ajouterImages
    );

    app.get('/api/images', listerImages);
    app.get('/api/images/:id', obtenirImageParId);

    app.put('/api/images/:id',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 1 } // Pour mise à jour, une seule à la fois
        ]),
        mettreAJourImage
    );

    app.delete('/api/images/:id', supprimerImage);
};

