const fs = require('fs');
const path = require('path');
const { Image } = require('../models/imageModel');
const { Attribut } = require('../models/attributModel');

async function supprimerImagesEtAttributsParEntite(entiteType, entiteId) {
    try {
        // Supprimer les attributs associés
        await Attribut.destroy({
            where: {
                entiteType,
                entiteId
            }
        });

        // Supprimer les images associées
        const images = await Image.findAll({
            where: { entiteType, entiteId }
        });

        for (const image of images) {
            const imagePath = path.join(__dirname, '..', image.chemin); // Suppression du fichier image
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            await image.destroy(); // Supprimer l'image en base de données
        }
    } catch (error) {
        console.error(`Erreur suppression images et attributs pour ${entiteType} ${entiteId}:`, error);
        throw new Error('Erreur lors de la suppression des images et attributs');
    }
}

module.exports = { supprimerImagesEtAttributsParEntite };
