const { Attribut } = require('../db/sequelize');

const attributController = {
    // Créer un attribut
    async creer(req, res) {
        try {
            const { entiteType, entiteId, nom, valeur } = req.body;

            // Vérification de la présence des données
            if (!entiteType || !entiteId || !nom) {
                return res.status(400).json({ message: 'Les champs entiteType, entiteId et nom sont requis.' });
            }

            const attribut = await Attribut.create({ entiteType, entiteId, nom, valeur });
            res.status(201).json(attribut);
        } catch (err) {
            res.status(400).json({ message: 'Erreur lors de la création de l\'attribut.', erreur: err.message });
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
            res.status(500).json({ message: 'Erreur lors de la récupération des attributs.', erreur: err.message });
        }
    },

    // Récupérer tous les attributs d'une entité spécifique sans spécifier l'ID
    async listerParType(req, res) {
        try {
            const { type } = req.params;  // type = 'Personnage', 'Planete', etc.

            const attributs = await Attribut.findAll({
                where: { entiteType: type }  // Filtre par type d'entité
            });

            if (attributs.length === 0) {
                return res.status(404).json({ message: `Aucun attribut trouvé pour les entités de type ${type}.` });
            }

            res.json(attributs);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des attributs pour cette entité.', erreur: err.message });
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

            if (attributs.length === 0) {
                return res.status(404).json({ message: `Aucun attribut trouvé pour l'entité ${type} avec ID ${id}.` });
            }

            res.json(attributs);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des attributs pour cette entité.', erreur: err.message });
        }
    },

    // Récupérer un attribut par ID
    async lire(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) {
                return res.status(404).json({ message: 'Attribut non trouvé.' });
            }
            res.json(attribut);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'attribut.', erreur: err.message });
        }
    },

    // Mettre à jour un attribut
    async modifier(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) {
                return res.status(404).json({ message: 'Attribut non trouvé.' });
            }

            const { entiteType, entiteId, nom, valeur } = req.body;

            if (!entiteType && !entiteId && !nom) {
                return res.status(400).json({ message: 'Les champs entiteType, entiteId, et nom sont nécessaires pour la mise à jour.' });
            }

            await attribut.update({ entiteType, entiteId, nom, valeur });
            res.json(attribut);
        } catch (err) {
            res.status(400).json({ message: 'Erreur lors de la modification de l\'attribut.', erreur: err.message });
        }
    },

    // Supprimer un attribut
    async supprimer(req, res) {
        try {
            const attribut = await Attribut.findByPk(req.params.id);
            if (!attribut) {
                return res.status(404).json({ message: 'Attribut non trouvé.' });
            }

            await attribut.destroy();
            res.json({ message: 'Attribut supprimé avec succès.' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'attribut.', erreur: err.message });
        }
    }
};

module.exports = attributController;
