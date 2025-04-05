
const {
    Personnage, Faction, Groupe, Planete, Pouvoir,
    Vehicule, Equipement, Attribut, Image
} = require('../db/sequelize');
const path = require('path');
const fs = require('fs');

const attributController = {
    // Créer un attribut
    async creer(req, res) {
        try {
            const attribut = await Attribut.create(req.body);
            res.status(201).json(attribut);
        } catch (err) {
            res.status(400).json({ message: 'Erreur lors de la création de l\'attribut.', erreur: err });
        }
    },

    // Récupérer tous les attributs (optionnel : filtrer par entité)
    async lister(req, res) {
        try {
            const { entiteType, entiteId } = req.query;

            let condition = {};
            if (entiteType && entiteId) {
                condition = { entiteType, entiteId };
            }

            const attributs = await Attribut.findAll({ where: condition });
            res.json(attributs);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des attributs.', erreur: err });
        }
    },

    // Récupérer les attributs d'une entité spécifique (via URL)
    async listerParEntite(req, res) {
        try {
            const { type, id } = req.params;

            const attributs = await Attribut.findAll({
                where: {
                    entiteType: type,
                    entiteId: id
                }
            });

            res.json(attributs);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des attributs pour cette entité.', erreur: err });
        }
    },

    // Récupérer un attribut par ID
    async lire(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) return res.status(404).json({ message: 'Attribut non trouvé.' });
            res.json(attribut);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'attribut.', erreur: err });
        }
    },

    // Mettre à jour un attribut
    async modifier(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) return res.status(404).json({ message: 'Attribut non trouvé.' });

            await attribut.update(req.body);
            res.json(attribut);
        } catch (err) {
            res.status(400).json({ message: 'Erreur lors de la modification de l\'attribut.', erreur: err });
        }
    },

    // Supprimer un attribut
    async supprimer(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) return res.status(404).json({ message: 'Attribut non trouvé.' });

            await attribut.destroy();
            res.json({ message: 'Attribut supprimé avec succès.' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'attribut.', erreur: err });
        }
    }
};

module.exports = attributController;
