const { Image } = require('../models');
const fs = require('fs');
const path = require('path');

// Créer une image
exports.creerImage = async (req, res) => {
    try {
        const { entiteId, entiteType, nom, type } = req.body;
        const fichier = req.file;

        if (!fichier) {
            return res.status(400).json({ message: "Aucun fichier image téléchargé" });
        }

        const image = await Image.create({
            entiteId,
            entiteType,
            nom,
            type,
            url: `/uploads/${fichier.filename}`
        });

        res.status(201).json(image);
    } catch (error) {
        console.error("Erreur lors de la création de l'image :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir toutes les images
exports.obtenirToutesLesImages = async (req, res) => {
    try {
        const images = await Image.findAll();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir une image par ID
exports.obtenirImageParId = async (req, res) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée" });
        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour une image
exports.mettreAJourImage = async (req, res) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée" });
        }

        const { nom, type } = req.body;
        const fichier = req.file;

        const nouvellesValeurs = {
            nom: nom || image.nom,
            type: type || image.type,
            url: fichier ? `/uploads/${fichier.filename}` : image.url
        };

        await image.update(nouvellesValeurs);
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.supprimerImage = async (req, res) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée" });
        }

        // Supprimer le fichier sur le disque
        const cheminAbsolu = path.join(__dirname, '..', image.url);
        fs.unlink(cheminAbsolu, async (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error("Erreur lors de la suppression du fichier :", err);
                return res.status(500).json({ message: "Erreur lors de la suppression du fichier" });
            }

            // Supprimer l'enregistrement en base de données
            await image.destroy();
            res.status(200).json({ message: "Image supprimée avec succès" });
        });
    } catch (error) {
        console.error("Erreur suppression image :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

