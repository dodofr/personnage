const { Personnage, Attribut, Image, Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

const creerPersonnage = async (req, res) => {
    try {
        const { nom, stats, descriptif, attributs, planetes, vehicules, factions, pouvoirs, groupes, equipements, imagePrincipale, imagesSecondaires } = req.body;

        // Vérification de l'existence des entités par nom et création si nécessaire
        const verifyOrCreate = async (model, name) => {
            let entity = await model.findOne({ where: { nom: name } });
            if (!entity) {
                entity = await model.create({ nom: name });
            }
            return entity;
        };

        // Création du personnage
        const personnage = await Personnage.create({
            nom,
            stats,
            descriptif
        });

        // Rattacher les relations avec les entités existantes ou créées
        const planetesAssociations = await Promise.all(planetes.map(async (name) => {
            const planete = await verifyOrCreate(Planete, name);
            return planete.id;
        }));

        const vehiculesAssociations = await Promise.all(vehicules.map(async (name) => {
            const vehicule = await verifyOrCreate(Vehicule, name);
            return vehicule.id;
        }));

        const factionsAssociations = await Promise.all(factions.map(async (name) => {
            const faction = await verifyOrCreate(Faction, name);
            return faction.id;
        }));

        const pouvoirsAssociations = await Promise.all(pouvoirs.map(async (name) => {
            const pouvoir = await verifyOrCreate(Pouvoir, name);
            return pouvoir.id;
        }));

        const groupesAssociations = await Promise.all(groupes.map(async (name) => {
            const groupe = await verifyOrCreate(Groupe, name);
            return groupe.id;
        }));

        const equipementsAssociations = await Promise.all(equipements.map(async (name) => {
            const equipement = await verifyOrCreate(Equipement, name);
            return equipement.id;
        }));

        // Mise à jour des relations
        await personnage.setPlanetes(planetesAssociations);
        await personnage.setVehicules(vehiculesAssociations);
        await personnage.setFactions(factionsAssociations);
        await personnage.setPouvoirs(pouvoirsAssociations);
        await personnage.setGroupes(groupesAssociations);
        await personnage.setEquipements(equipementsAssociations);

        // Gestion des attributs dynamiques
        if (attributs && Array.isArray(attributs)) {
            for (const attribut of attributs) {
                await Attribut.create({
                    nom: attribut.nom,
                    valeur: attribut.valeur,
                    entiteId: personnage.id,
                    entiteType: 'Personnage'
                });
            }
        }

        // Gérer les images
        if (imagePrincipale) {
            await personnage.createImage({
                nom: imagePrincipale.originalname,
                chemin: imagePrincipale.path,
                type: imagePrincipale.mimetype,
                imagePrincipale: true
            });
        }

        if (imagesSecondaires && Array.isArray(imagesSecondaires)) {
            for (const image of imagesSecondaires) {
                await personnage.createImage({
                    nom: image.originalname,
                    chemin: image.path,
                    type: image.mimetype,
                    imagePrincipale: false
                });
            }
        }

        res.status(201).json(personnage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du personnage.' });
    }
};


async function obtenirTousLesPersonnages(req, res) {
    try {
        const personnages = await Personnage.findAll({
            include: [
                { model: Attribut, where: { entiteType: 'Personnage' }, required: false },
                { model: Image, where: { entiteType: 'Personnage' }, required: false },
                Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement
            ]
        });
        res.status(200).json(personnages);
    } catch (error) {
        console.error("Erreur récupération personnages :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirPersonnageParId(req, res) {
    try {
        const personnage = await Personnage.findByPk(req.params.id, {
            include: [
                { model: Attribut, where: { entiteType: 'Personnage' }, required: false },
                { model: Image, where: { entiteType: 'Personnage' }, required: false },
                Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement
            ]
        });

        if (!personnage) {
            return res.status(404).json({ message: "Personnage introuvable" });
        }

        res.status(200).json(personnage);
    } catch (error) {
        console.error("Erreur récupération personnage :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourPersonnage(req, res) {
    try {
        const { nom, stats, descriptif, attributs, planetes, vehicules, factions, pouvoirs, groupes, equipements } = req.body;

        const personnage = await Personnage.findByPk(req.params.id);
        if (!personnage) return res.status(404).json({ message: "Personnage introuvable" });

        await personnage.update({
            nom,
            stats: stats ? JSON.parse(stats) : null,
            descriptif
        });

        await Attribut.destroy({ where: { entiteId: personnage.id, entiteType: 'Personnage' } });
        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Personnage',
                    entiteId: personnage.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        const images = await Image.findAll({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        if (req.files.imagePrincipale) {
            await Image.create({
                entiteType: 'Personnage',
                entiteId: personnage.id,
                url: `/${pathForDB(req.files.imagePrincipale[0], req)}`,
                type: 'principale'
            });
        }

        if (req.files.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Personnage',
                    entiteId: personnage.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        await personnage.setPlanetes([]);
        await personnage.setVehicules([]);
        await personnage.setFactions([]);
        await personnage.setPouvoirs([]);
        await personnage.setGroupes([]);
        await personnage.setEquipements([]);

        const relations = {
            Planete: planetes,
            Vehicule: vehicules,
            Faction: factions,
            Pouvoir: pouvoirs,
            Groupe: groupes,
            Equipement: equipements
        };

        for (const [modelName, value] of Object.entries(relations)) {
            if (value) {
                const ids = JSON.parse(value);
                for (const id of ids) {
                    const instance = await eval(modelName).findByPk(id);
                    if (instance) await personnage[`add${modelName}`](instance);
                }
            }
        }

        res.status(200).json(personnage);
    } catch (error) {
        console.error("Erreur mise à jour personnage :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function supprimerPersonnage(req, res) {
    try {
        const personnage = await Personnage.findByPk(req.params.id);
        if (!personnage) return res.status(404).json({ message: "Personnage introuvable" });

        await personnage.setPlanetes([]);
        await personnage.setVehicules([]);
        await personnage.setFactions([]);
        await personnage.setPouvoirs([]);
        await personnage.setGroupes([]);
        await personnage.setEquipements([]);

        await Attribut.destroy({ where: { entiteId: personnage.id, entiteType: 'Personnage' } });

        const images = await Image.findAll({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await personnage.destroy();
        res.status(200).json({ message: "Personnage supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression personnage :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerPersonnage,
    obtenirTousLesPersonnages,
    obtenirPersonnageParId,
    mettreAJourPersonnage,
    supprimerPersonnage
};
