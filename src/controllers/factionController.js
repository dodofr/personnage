const { Faction, Attribut, Image, Personnage, Groupe } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

async function creerFaction(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const imagePrincipale = req.files.imagePrincipale?.[0] || null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        const faction = await Faction.create({ nom, description });

        if (attributs) {
            const parsed = JSON.parse(attributs);
            for (const attr of parsed) {
                await Attribut.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Faction',
                entiteId: faction.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Faction',
                entiteId: faction.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await faction.addPersonnage(personnage);
            }
        }

        res.status(201).json(faction);
    } catch (error) {
        console.error("Erreur création faction :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de la faction." });
    }
}

async function obtenirToutesLesFactions(req, res) {
    try {
        const factions = await Faction.findAll({
            include: [
                { model: Personnage, as: 'personnages' },
                { model: Attribut, as: 'attributs', where: { entiteType: 'Faction' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Faction' }, required: false },
                { model: Groupe, as: 'groupes' }
            ]
        });
        res.status(200).json(factions);
    } catch (error) {
        console.error("Erreur récupération factions :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirFactionParId(req, res) {
    try {
        const faction = await Faction.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs', where: { entiteType: 'Faction' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Faction' }, required: false },
                { model: Personnage, as: 'personnages', through: { attributes: [] } },
                { model: Groupe, as: 'groupes' }
            ]
        });

        if (!faction) return res.status(404).json({ message: "Faction introuvable" });

        res.status(200).json(faction);
    } catch (error) {
        console.error("Erreur récupération faction :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourFaction(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const faction = await Faction.findByPk(req.params.id);
        if (!faction) return res.status(404).json({ message: "Faction introuvable" });

        await faction.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteId: faction.id, entiteType: 'Faction' } });
            const parsed = JSON.parse(attributs);
            for (const attr of parsed) {
                await Attribut.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        const images = await Image.findAll({
            where: { entiteType: 'Faction', entiteId: faction.id }
        });

        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        if (req.files?.imagePrincipale) {
            await Image.create({
                entiteType: 'Faction',
                entiteId: faction.id,
                url: `/${pathForDB(req.files.imagePrincipale[0], req)}`,
                type: 'principale'
            });
        }

        if (req.files?.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Faction',
                    entiteId: faction.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await faction.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await faction.addPersonnage(personnage);
            }
        }

        res.status(200).json(faction);
    } catch (error) {
        console.error("Erreur mise à jour faction :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la faction." });
    }
}

async function supprimerFaction(req, res) {
    try {
        const id = req.params.id;
        const faction = await Faction.findByPk(id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!faction) return res.status(404).json({ message: "Faction introuvable" });

        await faction.setPersonnages([]);
        await Attribut.destroy({ where: { entiteType: 'Faction', entiteId: faction.id } });

        const images = await Image.findAll({
            where: { entiteType: 'Faction', entiteId: faction.id }
        });

        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await faction.destroy();
        res.status(200).json({ message: 'Faction supprimée avec succès' });
    } catch (error) {
        console.error("Erreur suppression faction :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerFaction,
    obtenirToutesLesFactions,
    obtenirFactionParId,
    mettreAJourFaction,
    supprimerFaction
};
