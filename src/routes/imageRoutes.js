const upload = require('../upload/upload'); // Middleware multer

const {
    creerImage,
    obtenirToutesLesImages,
    obtenirImageParId,
    mettreAJourImage,
    supprimerImage
} = require('../controllers/imageController');

module.exports = (app) => {
    // Créer une image
    app.post('/api/images', upload.single('image'), creerImage);

    // Lire toutes les images
    app.get('/api/images', obtenirToutesLesImages);

    // Lire une image par ID
    app.get('/api/images/:id', obtenirImageParId);

    // Modifier une image
    app.put('/api/images/:id', upload.single('image'), mettreAJourImage);

    // Supprimer une image
    app.delete('/api/images/:id', supprimerImage);
};
