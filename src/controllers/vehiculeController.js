const { Vehicule, Attribut, Image, Personnage } = require('../models');
const fs = require('fs');
const path = require('path');

// ✅ Créer un véhicule
exports.creerVehicule = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const vehicule = await Vehicule.create({ nom, description });

        // Attributs dynamiques
        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        // Liens avec personnages
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await vehicule.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(vehicule);
    } catch (error) {
        console.error("Erreur création véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Obtenir tous les véhicules
exports.obtenirTousLesVehicules = async (req, res) => {
    try {
        const vehicules = await Vehicule.findAll({
            include: ['attributs', 'images', 'Personnages']
        });
        res.status(200).json(vehicules);
    } catch (error) {
        console.error("Erreur récupération véhicules :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Obtenir un véhicule par ID
exports.obtenirVehiculeParId = async (req, res) => {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id, {
            include: ['attributs', 'images', 'Personnages']
        });

        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        res.status(200).json(vehicule);
    } catch (error) {
        console.error("Erreur récupération véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Mettre à jour un véhicule
exports.mettreAJourVehicule = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const vehicule = await Vehicule.findByPk(req.params.id);
        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        await vehicule.update({ nom, description });

        // Mettre à jour les attributs
        if (attributs) {
            await Attribut.destroy({
                where: { entiteId: vehicule.id, entiteType: 'Vehicule' }
            });

            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Nouvelles images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        // Mise à jour des liens avec personnages
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await vehicule.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await vehicule.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(vehicule);
    } catch (error) {
        console.error("Erreur mise à jour véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Supprimer un véhicule
exports.supprimerVehicule = async (req, res) => {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id);
        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        // Supprimer les images associées
        const images = await Image.findAll({
            where: { entiteId: vehicule.id, entiteType: 'Vehicule' }
        });

        for (const image of images) {
            const imagePath = path.join(__dirname, '..', image.url);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await Attribut.destroy({ where: { entiteId: vehicule.id, entiteType: 'Vehicule' } });
        await vehicule.setPersonnages([]);
        await vehicule.destroy();

        res.status(200).json({ message: "Véhicule supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
