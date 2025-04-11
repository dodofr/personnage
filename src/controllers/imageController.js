const { Image } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

// Utilitaire : chemin à stocker en BDD
const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

async function ajouterImages(req, res) {
    try {
        const { entiteType, entiteId } = req.body;

        const imagePrincipale = req.files.imagePrincipale ? req.files.imagePrincipale[0] : null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        const imagesEnregistrees = [];

        if (imagePrincipale) {
            const image = await Image.create({
                entiteType,
                entiteId,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
            imagesEnregistrees.push(image);
        }

        for (const file of imagesSecondaires) {
            const image = await Image.create({
                entiteType,
                entiteId,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
            imagesEnregistrees.push(image);
        }

        res.status(201).json(imagesEnregistrees);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'images :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout des images." });
    }
}

async function supprimerImage(req, res) {
    try {
        const image = await Image.findByPk(req.params.id);

        if (!image) {
            return res.status(404).json({ message: "Image introuvable" });
        }

        const imagePath = resolveUploadPathFromDB(image);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log("Image supprimée du disque :", imagePath);
        }

        await image.destroy();

        res.status(200).json({ message: "Image supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression d'image :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function listerImages(req, res) {
    try {
        const { entiteType, entiteId } = req.query;

        const whereClause = {};
        if (entiteType) whereClause.entiteType = entiteType;
        if (entiteId) whereClause.entiteId = entiteId;

        const images = await Image.findAll({ where: whereClause });
        res.status(200).json(images);
    } catch (error) {
        console.error("Erreur lors de la récupération des images :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}
async function obtenirImageParId(req, res) {
    try {
        const image = await Image.findByPk(req.params.id);

        if (!image) {
            return res.status(404).json({ message: "Image introuvable" });
        }

        res.status(200).json(image);
    } catch (error) {
        console.error("Erreur récupération image :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourImage(req, res) {
    try {
        const image = await Image.findByPk(req.params.id);

        if (!image) {
            return res.status(404).json({ message: "Image introuvable" });
        }

        const imagePrincipale = req.files?.imagePrincipale?.[0];
        const imageSecondaire = req.files?.imagesSecondaires?.[0];

        // Supprimer l'ancien fichier
        const ancienChemin = resolveUploadPathFromDB(image);
        if (fs.existsSync(ancienChemin)) {
            fs.unlinkSync(ancienChemin);
            console.log("Ancien fichier supprimé :", ancienChemin);
        }

        let nouvelleImage = imagePrincipale || imageSecondaire;
        const nouveauChemin = `/${pathForDB(nouvelleImage, req)}`;

        await image.update({
            url: nouveauChemin,
            type: req.body.type || image.type,
            entiteType: req.body.entiteType || image.entiteType,
            entiteId: req.body.entiteId || image.entiteId
        });

        res.status(200).json(image);
    } catch (error) {
        console.error("Erreur mise à jour image :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'image." });
    }
}


module.exports = {
    ajouterImages,
    supprimerImage,
    listerImages,
    obtenirImageParId,
    mettreAJourImage
};
