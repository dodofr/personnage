const { Vehicule, Attribut, Image, Personnage } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

async function creerVehicule(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const imagePrincipale = req.files.imagePrincipale?.[0] || null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        const vehicule = await Vehicule.create({ nom, description });

        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Vehicule',
                entiteId: vehicule.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Vehicule',
                entiteId: vehicule.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const id of personnagesArray) {
                const personnage = await Personnage.findByPk(id);
                if (personnage) await vehicule.addPersonnage(personnage);
            }
        }

        res.status(201).json(vehicule);
    } catch (error) {
        console.error("Erreur création véhicule :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du véhicule." });
    }
}

// Les autres fonctions sont similaires à équipement, avec "Vehicule" au lieu de "Equipement"
async function obtenirTousLesVehicules(req, res) {
    try {
        const vehicules = await Vehicule.findAll({
            include: [
                { model: Personnage, as: 'personnages' },
                { model: Attribut, as: 'attributs', where: { entiteType: 'Vehicule' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Vehicule' }, required: false }
            ]
        });
        res.status(200).json(vehicules);
    } catch (error) {
        console.error("Erreur récupération véhicules :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirVehiculeParId(req, res) {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id, {
            include: [
                { model: Attribut, as: 'attributs', where: { entiteType: 'Vehicule' }, required: false },
                { model: Image, as: 'images', where: { entiteType: 'Vehicule' }, required: false },
                { model: Personnage, as: 'personnages', through: { attributes: [] } }
            ]
        });

        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        res.status(200).json(vehicule);
    } catch (error) {
        console.error("Erreur récupération véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourVehicule(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const vehicule = await Vehicule.findByPk(req.params.id);
        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        await vehicule.update({ nom, description });

        if (attributs) {
            await Attribut.destroy({ where: { entiteType: 'Vehicule', entiteId: vehicule.id } });
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        const images = await Image.findAll({ where: { entiteType: 'Vehicule', entiteId: vehicule.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        if (req.files?.imagePrincipale) {
            const imagePrincipale = req.files.imagePrincipale[0];
            await Image.create({
                entiteType: 'Vehicule',
                entiteId: vehicule.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        if (req.files?.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Vehicule',
                    entiteId: vehicule.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await vehicule.setPersonnages([]);
            for (const id of personnagesArray) {
                const personnage = await Personnage.findByPk(id);
                if (personnage) await vehicule.addPersonnage(personnage);
            }
        }

        res.status(200).json(vehicule);
    } catch (error) {
        console.error("Erreur mise à jour véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function supprimerVehicule(req, res) {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!vehicule) return res.status(404).json({ message: "Véhicule introuvable" });

        await vehicule.setPersonnages([]);
        await Attribut.destroy({ where: { entiteType: 'Vehicule', entiteId: vehicule.id } });

        const images = await Image.findAll({ where: { entiteType: 'Vehicule', entiteId: vehicule.id } });
        for (const image of images) {
            const imagePath = resolveUploadPathFromDB(image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            await image.destroy();
        }

        await vehicule.destroy();
        res.status(200).json({ message: 'Véhicule supprimé avec succès' });
    } catch (error) {
        console.error("Erreur suppression véhicule :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerVehicule,
    obtenirTousLesVehicules,
    obtenirVehiculeParId,
    mettreAJourVehicule,
    supprimerVehicule
};
