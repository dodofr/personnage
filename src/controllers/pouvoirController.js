const { Pouvoir, Attribut, Image, Personnage } = require('../models');
const { Op } = require('sequelize');

// ✅ Créer un pouvoir
exports.creerPouvoir = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const pouvoir = await Pouvoir.create({ nom, description });

        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Pouvoir',
                    entiteId: pouvoir.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Pouvoir',
                    entiteId: pouvoir.id,
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
                    await pouvoir.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(pouvoir);
    } catch (error) {
        console.error("Erreur création pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Obtenir tous les pouvoirs
exports.obtenirTousLesPouvoirs = async (req, res) => {
    try {
        const pouvoirs = await Pouvoir.findAll({
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: Personnage, through: { attributes: [] } }
            ]
        });
        res.json(pouvoirs);
    } catch (error) {
        console.error("Erreur récupération pouvoirs :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Obtenir un pouvoir par ID
exports.obtenirPouvoirParId = async (req, res) => {
    try {
        const pouvoir = await Pouvoir.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: Personnage, through: { attributes: [] } }
            ]
        });

        if (!pouvoir) {
            return res.status(404).json({ message: "Pouvoir introuvable" });
        }

        res.json(pouvoir);
    } catch (error) {
        console.error("Erreur récupération pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Mettre à jour un pouvoir
exports.mettreAJourPouvoir = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const pouvoir = await Pouvoir.findByPk(req.params.id);
        if (!pouvoir) {
            return res.status(404).json({ message: "Pouvoir introuvable" });
        }

        await pouvoir.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteId: pouvoir.id, entiteType: 'Pouvoir' } });

            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Pouvoir',
                    entiteId: pouvoir.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Pouvoir',
                    entiteId: pouvoir.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await pouvoir.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await pouvoir.addPersonnage(personnage);
                }
            }
        }

        res.json(pouvoir);
    } catch (error) {
        console.error("Erreur mise à jour pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Supprimer un pouvoir
exports.supprimerPouvoir = async (req, res) => {
    try {
        const pouvoir = await Pouvoir.findByPk(req.params.id);
        if (!pouvoir) {
            return res.status(404).json({ message: "Pouvoir introuvable" });
        }

        await Attribut.destroy({ where: { entiteId: pouvoir.id, entiteType: 'Pouvoir' } });
        await Image.destroy({ where: { entiteId: pouvoir.id, entiteType: 'Pouvoir' } });

        await pouvoir.setPersonnages([]);
        await pouvoir.destroy();

        res.status(204).end();
    } catch (error) {
        console.error("Erreur suppression pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
