const { Faction, Vaisseau } = require('../db/sequelize');

async function creerFaction(req, res) {
    try {
        const { nom } = req.body;
        const nouvelleFaction = await Faction.create({ nom });
        res.status(201).json(nouvelleFaction);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la faction", error: error.message });
    }
}

async function mettreAJourFaction(req, res) {
    try {
        const { id } = req.params;
        const { nom } = req.body;

        const faction = await Faction.findByPk(id);
        if (!faction) {
            return res.status(404).json({ message: "Faction non trouvée" });
        }

        await faction.update({ nom });
        res.status(200).json(faction);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la faction", error: error.message });
    }
}

async function obtenirToutesLesFactions(req, res) {
    try {
        const factions = await Faction.findAll({
            include: { model: Vaisseau, through: { attributes: [] } } // Inclut les vaisseaux associés
        });
        res.status(200).json(factions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des factions", error: error.message });
    }
}

async function obtenirFactionParId(req, res) {
    try {
        const { id } = req.params;
        const faction = await Faction.findByPk(id, {
            include: { model: Vaisseau, through: { attributes: [] } } // Inclut les vaisseaux associés
        });

        if (!faction) {
            return res.status(404).json({ message: "Faction non trouvée" });
        }

        res.status(200).json(faction);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la faction", error: error.message });
    }
}

async function supprimerFaction(req, res) {
    try {
        const { id } = req.params;
        const faction = await Faction.findByPk(id);

        if (!faction) {
            return res.status(404).json({ message: "Faction non trouvée" });
        }

        // Suppression de la faction et de ses associations
        await faction.destroy();
        res.status(200).json({ message: "Faction supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la faction", error: error.message });
    }
}

module.exports = {
    creerFaction,
    mettreAJourFaction,
    obtenirToutesLesFactions,
    obtenirFactionParId, 
    supprimerFaction
};
