const { Faction, Attribut, Image, Personnage } = require('../models');

exports.creerFaction = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const faction = await Faction.create({ nom, description });

        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files?.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
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
                    await faction.addPersonnage(personnage);
                }
            }
        }

        res.status(201).json(faction);
    } catch (error) {
        console.error("Erreur création Faction :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.obtenirToutesLesFactions = async (req, res) => {
    try {
        const factions = await Faction.findAll({
            include: ['attributs', 'images', 'personnages']
        });
        res.status(200).json(factions);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.obtenirFactionParId = async (req, res) => {
    try {
        const faction = await Faction.findByPk(req.params.id, {
            include: ['attributs', 'images', 'personnages']
        });

        if (!faction) return res.status(404).json({ message: "Faction non trouvée" });

        res.status(200).json(faction);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.mettreAJourFaction = async (req, res) => {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const faction = await Faction.findByPk(req.params.id);
        if (!faction) return res.status(404).json({ message: "Faction introuvable" });

        await faction.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteId: faction.id, entiteType: 'Faction' } });

            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (req.files?.length > 0) {
            for (const file of req.files) {
                await Image.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    url: `/uploads/${file.filename}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await faction.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await faction.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(faction);
    } catch (error) {
        console.error("Erreur mise à jour faction :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.supprimerFaction = async (req, res) => {
    try {
        const faction = await Faction.findByPk(req.params.id);
        if (!faction) return res.status(404).json({ message: "Faction introuvable" });

        await Attribut.destroy({ where: { entiteId: faction.id, entiteType: 'Faction' } });
        await Image.destroy({ where: { entiteId: faction.id, entiteType: 'Faction' } });

        await faction.destroy();

        res.status(200).json({ message: "Faction supprimée" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
