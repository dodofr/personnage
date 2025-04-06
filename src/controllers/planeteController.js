const { Planete, Attribut, Image, Personnage } = require('../models');

// Créer une planète
exports.creerPlanete = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const planete = await Planete.create({ nom, description });

        // Attributs dynamiques
        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Planete',
                    entiteId: planete.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Planete',
                    entiteId: planete.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        // Associations avec les personnages
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await planete.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(planete);
    } catch (error) {
        console.error("Erreur création planète :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir toutes les planètes
exports.obtenirToutesLesPlanetes = async (req, res) => {
    try {
        const planetes = await Planete.findAll({
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: Personnage, through: { attributes: [] } }
            ]
        });
        res.status(200).json(planetes);
    } catch (error) {
        console.error("Erreur récupération planètes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Obtenir une planète par ID
exports.obtenirPlaneteParId = async (req, res) => {
    try {
        const planete = await Planete.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs' },
                { model: Image, as: 'images' },
                { model: Personnage, through: { attributes: [] } }
            ]
        });

        if (!planete) {
            return res.status(404).json({ message: "Planète introuvable" });
        }

        res.status(200).json(planete);
    } catch (error) {
        console.error("Erreur récupération planète :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour une planète
exports.mettreAJourPlanete = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const planete = await Planete.findByPk(req.params.id);
        if (!planete) {
            return res.status(404).json({ message: "Planète introuvable" });
        }

        await planete.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteId: planete.id, entiteType: 'Planete' } });

            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Planete',
                    entiteId: planete.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Planete',
                    entiteId: planete.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await planete.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await planete.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(planete);
    } catch (error) {
        console.error("Erreur mise à jour planète :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer une planète
exports.supprimerPlanete = async (req, res) => {
    try {
        const planete = await Planete.findByPk(req.params.id);
        if (!planete) {
            return res.status(404).json({ message: "Planète introuvable" });
        }

        await Attribut.destroy({ where: { entiteId: planete.id, entiteType: 'Planete' } });
        await Image.destroy({ where: { entiteId: planete.id, entiteType: 'Planete' } });
        await planete.destroy();

        res.status(200).json({ message: "Planète supprimée avec succès" });
    } catch (error) {
        console.error("Erreur suppression planète :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
