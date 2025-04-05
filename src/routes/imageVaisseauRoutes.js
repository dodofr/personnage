const upload = require('../upload/upload');
const {
    creerImageVaisseau,
    obtenirToutesLesImages,
    obtenirImageParId,
    mettreAJourImage,
    supprimerImage
} = require("../controllers/imageVaisseauController");

module.exports = (app) => {
    // Créer une image pour un vaisseau avec upload
    app.post("/api/images-vaisseaux", upload.single('image'), creerImageVaisseau);

    // Obtenir toutes les images de vaisseaux
    app.get("/api/images-vaisseaux", obtenirToutesLesImages);

    // Obtenir une image par ID
    app.get("/api/images-vaisseaux/:id", obtenirImageParId);

    // Mettre à jour une image (avec possibilité de changer l'image)
    app.put("/api/images-vaisseaux/:id", upload.single('image'), mettreAJourImage);

    // Supprimer une image
    app.delete("/api/images-vaisseaux/:id", supprimerImage);
};
