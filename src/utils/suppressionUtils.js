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

        // Récupérer toutes les images associées à cette entité
        const images = await Image.findAll({
            where: { entiteType, entiteId }
        });

        if (images.length === 0) {
            console.log(`Aucune image trouvée pour ${entiteType} avec l'ID ${entiteId}.`);
            return;
        }

        // Si des images sont trouvées, les supprimer
        for (const image of images) {
            if (image && image.chemin) {
                const imagePath = path.join(__dirname, '..', image.chemin); // Suppression du fichier image
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Image supprimée du serveur: ${imagePath}`);
                }
                await image.destroy(); // Supprimer l'image en base de données
            }
        }
    } catch (error) {
        console.error(`Erreur suppression images et attributs pour ${entiteType} ${entiteId}:`, error);
        throw new Error('Erreur lors de la suppression des images et attributs');
    }
}

module.exports = { supprimerImagesEtAttributsParEntite };
