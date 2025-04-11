const { Pouvoir, Attribut, Image, Personnage } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

async function creerPouvoir(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const imagePrincipale = req.files.imagePrincipale?.[0] || null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

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

        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Pouvoir',
                entiteId: pouvoir.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Pouvoir',
                entiteId: pouvoir.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const id of personnagesArray) {
                const personnage = await Personnage.findByPk(id);
                if (personnage) await pouvoir.addPersonnage(personnage);
            }
        }

        res.status(201).json(pouvoir);
    } catch (error) {
        console.error("Erreur création pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du pouvoir." });
    }
}

async function obtenirTousLesPouvoirs(req, res) {
    try {
        const pouvoirs = await Pouvoir.findAll({
            include: [
                { model: Personnage, as: 'personnages' },
                { model: Attribut, as: 'attributs', where: { entiteType: 'Pouvoir' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Pouvoir' }, required: false }
            ]
        });
        res.status(200).json(pouvoirs);
    } catch (error) {
        console.error("Erreur récupération pouvoirs :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirPouvoirParId(req, res) {
    try {
        const pouvoir = await Pouvoir.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs', where: { entiteType: 'Pouvoir' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Pouvoir' }, required: false },
                { model: Personnage, as: 'personnages', through: { attributes: [] } }
            ]
        });

        if (!pouvoir) return res.status(404).json({ message: "Pouvoir introuvable" });

        res.status(200).json(pouvoir);
    } catch (error) {
        console.error("Erreur récupération pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourPouvoir(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const pouvoir = await Pouvoir.findByPk(req.params.id);
        if (!pouvoir) return res.status(404).json({ message: "Pouvoir introuvable" });

        await pouvoir.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteType: 'Pouvoir', entiteId: pouvoir.id } });
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

        const images = await Image.findAll({ where: { entiteType: 'Pouvoir', entiteId: pouvoir.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        if (req.files?.imagePrincipale) {
            const imagePrincipale = req.files.imagePrincipale[0];
            await Image.create({
                entiteType: 'Pouvoir',
                entiteId: pouvoir.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        if (req.files?.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Pouvoir',
                    entiteId: pouvoir.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await pouvoir.setPersonnages([]);
            for (const id of personnagesArray) {
                const personnage = await Personnage.findByPk(id);
                if (personnage) await pouvoir.addPersonnage(personnage);
            }
        }

        res.status(200).json(pouvoir);
    } catch (error) {
        console.error("Erreur mise à jour pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function supprimerPouvoir(req, res) {
    try {
        const pouvoir = await Pouvoir.findByPk(req.params.id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!pouvoir) return res.status(404).json({ message: "Pouvoir introuvable" });

        await pouvoir.setPersonnages([]);
        await Attribut.destroy({ where: { entiteType: 'Pouvoir', entiteId: pouvoir.id } });

        const images = await Image.findAll({ where: { entiteType: 'Pouvoir', entiteId: pouvoir.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await pouvoir.destroy();
        res.status(200).json({ message: 'Pouvoir supprimé avec succès' });
    } catch (error) {
        console.error("Erreur suppression pouvoir :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerPouvoir,
    obtenirTousLesPouvoirs,
    obtenirPouvoirParId,
    mettreAJourPouvoir,
    supprimerPouvoir
};
