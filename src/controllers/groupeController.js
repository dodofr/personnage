const { Groupe, Attribut, Image, Personnage, Faction } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

async function creerGroupe(req, res) {
    try {
        const { nom, description, attributs, personnages, FactionId, factionNom } = req.body;

        let factionIdFinal = FactionId;
        
       // Résoudre la faction (ID ou nom) et la créer si elle n'existe pas
       if (!factionIdFinal && factionNom) {
        let faction = await Faction.findOne({ where: { nom: factionNom } });

        if (!faction) {
            faction = await Faction.create({
                nom: factionNom
            });
            console.log(`Faction créée : ${faction.nom}`);
        }

        factionIdFinal = faction.id;
    } else if (typeof FactionId === 'string' && isNaN(parseInt(FactionId))) {
        let faction = await Faction.findOne({ where: { nom: FactionId } });

        if (!faction) {
            faction = await Faction.create({
                nom: FactionId,
            });
            console.log(`Faction créée : ${faction.nom}`);
        }

        factionIdFinal = faction.id;
    }
        const imagePrincipale = req.files.imagePrincipale?.[0] || null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        const groupe = await Groupe.create({ nom, description, FactionId: factionIdFinal });

        if (attributs) {
            const parsed = JSON.parse(attributs);
            for (const attr of parsed) {
                await Attribut.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Groupe',
                entiteId: groupe.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Groupe',
                entiteId: groupe.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await groupe.addPersonnage(personnage);
            }
        }

        res.status(201).json(groupe);
    } catch (error) {
        console.error("Erreur création groupe :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du groupe." });
    }
}

async function obtenirTousLesGroupes(req, res) {
    try {
        const groupes = await Groupe.findAll({
            include: [
                { model: Personnage, as: 'personnages' },
                { model: Attribut, as: 'attributs', where: { entiteType: 'Groupe' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Groupe' }, required: false },
                { model: Faction, as: 'faction', attributes: ['id', 'nom'] } 
            ]
        });
        res.status(200).json(groupes);
    } catch (error) {
        console.error("Erreur récupération groupes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirGroupeParId(req, res) {
    try {
        const groupe = await Groupe.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs', where: { entiteType: 'Groupe' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Groupe' }, required: false },
                { model: Personnage, as: 'personnages', through: { attributes: [] } },
                { model: Faction, as: 'faction' }
            ]
        });

        if (!groupe) return res.status(404).json({ message: "Groupe introuvable" });

        res.status(200).json(groupe);
    } catch (error) {
        console.error("Erreur récupération groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourGroupe(req, res) {
    try {
        const { nom, description, attributs, personnages, FactionId, factionNom } = req.body;

        const groupe = await Groupe.findByPk(req.params.id);
        if (!groupe) return res.status(404).json({ message: "Groupe introuvable" });
        let factionIdFinal = FactionId;
        
        // Résoudre la faction (ID ou nom) et la créer si elle n'existe pas
        if (!factionIdFinal && factionNom) {
         let faction = await Faction.findOne({ where: { nom: factionNom } });
 
         if (!faction) {
             faction = await Faction.create({
                 nom: factionNom
             });
             console.log(`Faction créée : ${faction.nom}`);
         }
 
         factionIdFinal = faction.id;
     } else if (typeof FactionId === 'string' && isNaN(parseInt(FactionId))) {
         let faction = await Faction.findOne({ where: { nom: FactionId } });
 
         if (!faction) {
             faction = await Faction.create({
                 nom: FactionId,
             });
             console.log(`Faction créée : ${faction.nom}`);
         }
 
         factionIdFinal = faction.id;
     }
        await groupe.update({ nom, description, FactionId: factionIdFinal });

        if (attributs) {
            await Attribut.destroy({ where: { entiteId: groupe.id, entiteType: 'Groupe' } });
            const parsed = JSON.parse(attributs);
            for (const attr of parsed) {
                await Attribut.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        const images = await Image.findAll({
            where: { entiteType: 'Groupe', entiteId: groupe.id }
        });

        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        if (req.files?.imagePrincipale) {
            await Image.create({
                entiteType: 'Groupe',
                entiteId: groupe.id,
                url: `/${pathForDB(req.files.imagePrincipale[0], req)}`,
                type: 'principale'
            });
        }

        if (req.files?.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Groupe',
                    entiteId: groupe.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await groupe.setPersonnages([]);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await groupe.addPersonnage(personnage);
            }
        }

        res.status(200).json(groupe);
    } catch (error) {
        console.error("Erreur mise à jour groupe :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du groupe." });
    }
}

async function supprimerGroupe(req, res) {
    try {
        const id = req.params.id;
        const groupe = await Groupe.findByPk(id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!groupe) return res.status(404).json({ message: "Groupe introuvable" });

        await groupe.setPersonnages([]);
        await Attribut.destroy({ where: { entiteType: 'Groupe', entiteId: groupe.id } });

        const images = await Image.findAll({
            where: { entiteType: 'Groupe', entiteId: groupe.id }
        });

        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await groupe.destroy();
        res.status(200).json({ message: 'Groupe supprimé avec succès' });
    } catch (error) {
        console.error("Erreur suppression groupe :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerGroupe,
    obtenirTousLesGroupes,
    obtenirGroupeParId,
    mettreAJourGroupe,
    supprimerGroupe
};
