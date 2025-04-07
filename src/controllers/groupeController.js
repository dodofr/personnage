const { Groupe, Attribut, Image, Personnage } = require('../models');
const fs = require('fs');
const path = require('path');

// Créer un groupe
exports.creerGroupe = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const groupe = await Groupe.create({ nom, description });

        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await groupe.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(groupe);
    } catch (error) {
        console.error("Erreur création groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir tous les groupes
exports.obtenirTousLesGroupes = async (req, res) => {
    try {
        const groupes = await Groupe.findAll({
            include: ['attributs', 'images', 'personnages']
        });
        res.status(200).json(groupes);
    } catch (error) {
        console.error("Erreur récupération groupes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir un groupe par ID
exports.obtenirGroupeParId = async (req, res) => {
    try {
        const groupe = await Groupe.findByPk(req.params.id, {
            include: ['attributs', 'images', 'personnages']
        });

        if (!groupe) {
            return res.status(404).json({ message: "Groupe introuvable" });
        }

        res.status(200).json(groupe);
    } catch (error) {
        console.error("Erreur récupération groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour un groupe
exports.mettreAJourGroupe = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const groupe = await Groupe.findByPk(req.params.id);

        if (!groupe) {
            return res.status(404).json({ message: "Groupe introuvable" });
        }

        await groupe.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({
                where: { entiteId: groupe.id, entiteType: 'Groupe' }
            });
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await groupe.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await groupe.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(groupe);
    } catch (error) {
        console.error("Erreur mise à jour groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un groupe
exports.supprimerGroupe = async (req, res) => {
    try {
        const groupe = await Groupe.findByPk(req.params.id);

        if (!groupe) {
            return res.status(404).json({ message: "Groupe introuvable" });
        }

        const images = await Image.findAll({
            where: { entiteId: groupe.id, entiteType: 'Groupe' }
        });

        for (const image of images) {
            const filePath = path.join(__dirname, '..', image.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            await image.destroy();
        }

        await Attribut.destroy({
            where: { entiteId: groupe.id, entiteType: 'Groupe' }
        });

        await groupe.setPersonnages([]);
        await groupe.destroy();

        res.status(200).json({ message: "Groupe supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
