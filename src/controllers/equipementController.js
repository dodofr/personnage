// ✅ Créer un équipement
const {
    Personnage, Faction, Groupe, Planete, Pouvoir,
    Vehicule, Equipement, Attribut, Image
} = require('../db/sequelize');
const path = require('path');
const fs = require('fs');
exports.creerEquipement = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        // Créer l'équipement
        const equipement = await Equipement.create({ nom, description });

        // Ajouter les attributs dynamiques
        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Ajouter les images si présentes
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        // Associer l'équipement aux personnages (si des personnages sont passés)
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await models.Personnage.findByPk(personnageId);
                if (personnage) {
                    await equipement.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(equipement);
    } catch (error) {
        console.error("Erreur lors de la création de l'équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Mettre à jour un équipement
exports.mettreAJourEquipement = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const equipement = await Equipement.findByPk(req.params.id);
        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        await equipement.update({ nom, description });

        // Met à jour les attributs
        if (attributs) {
            await Attribut.destroy({
                where: { entiteId: equipement.id, entiteType: 'Equipement' }
            });

            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Ajouter de nouvelles images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        // Mettre à jour les associations avec les personnages
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await equipement.setPersonnages([]); // Supprimer toutes les associations actuelles
            for (const personnageId of personnagesArray) {
                const personnage = await models.Personnage.findByPk(personnageId);
                if (personnage) {
                    await equipement.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(equipement);
    } catch (error) {
        console.error("Erreur mise à jour équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
// ✅ Obtenir tous les équipements
exports.obtenirTousLesEquipements = async (req, res) => {
    try {
        const equipements = await Equipement.findAll({
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: models.Personnage, as: 'personnages' }
            ]
        });
        res.status(200).json(equipements);
    } catch (error) {
        console.error("Erreur lors de la récupération des équipements :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
// ✅ Obtenir un équipement par ID
exports.obtenirEquipementParId = async (req, res) => {
    try {
        const equipement = await Equipement.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: models.Personnage, as: 'personnages' }
            ]
        });

        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        res.status(200).json(equipement);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
// ✅ Supprimer un équipement
exports.supprimerEquipement = async (req, res) => {
    try {
        const equipement = await Equipement.findByPk(req.params.id);
        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        // Supprimer les associations avec les personnages
        await equipement.setPersonnages([]);

        // Supprimer les attributs associés
        await Attribut.destroy({
            where: { entiteId: equipement.id, entiteType: 'Equipement' }
        });

        // Supprimer les images associées
        await Image.destroy({
            where: { entiteId: equipement.id, entiteType: 'Equipement' }
        });

        // Supprimer l'équipement
        await equipement.destroy();

        res.status(200).json({ message: "Équipement supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

