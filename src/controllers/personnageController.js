const {
    Personnage, Faction, Groupe, Planete, Pouvoir,
    Vehicule, Equipement, Attribut, Image
} = require('../db/sequelize');
const path = require('path');
const fs = require('fs');
const { supprimerImagesEtAttributsParEntite } = require('../utils/suppressionUtils');
async function creerPersonnage(req, res) {
    try {
        const {
            nom, descriptif, stats, factions, groupes,
            planetes, pouvoirs, vehicules, equipements, attributs
        } = req.body;

        // Création du personnage
        const personnage = await Personnage.create({
            nom,
            descriptif,
            stats: stats ? JSON.parse(stats) : null
        });

        // Associations simples (many-to-many)
        if (factions) await personnage.setFactions(JSON.parse(factions));
        if (groupes) await personnage.setGroupes(JSON.parse(groupes));
        if (planetes) await personnage.setPlanetes(JSON.parse(planetes));
        if (pouvoirs) await personnage.setPouvoirs(JSON.parse(pouvoirs));
        if (vehicules) await personnage.setVehicules(JSON.parse(vehicules));
        if (equipements) await personnage.setEquipements(JSON.parse(equipements));

        // Attributs dynamiques (one-to-many avec entiteId/entiteType)
        if (attributs) {
            const parsed = JSON.parse(attributs);
            for (const attr of parsed) {
                await Attribut.create({
                    entiteId: personnage.id,
                    entiteType: 'Personnage',
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Images (upload via req.files)
        const images = req.files?.['images'] ?? [];
        for (const file of images) {
            await Image.create({
                entiteId: personnage.id,
                entiteType: 'Personnage',
                url: `uploads/personnages/${file.filename}`,
                type: 'principal'
            });
        }

        res.status(201).json(personnage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création du personnage." });
    }
}

async function obtenirTousLesPersonnages(req, res) {
    try {
        const personnages = await Personnage.findAll({
            include: [
                { model: Faction },
                { model: Groupe },
                { model: Planete },
                { model: Pouvoir },
                { model: Vehicule },
                { model: Equipement },
                {
                    model: Attribut,
                    where: { entiteType: 'Personnage' },
                    required: false
                },
                {
                    model: Image,
                    where: { entiteType: 'Personnage' },
                    required: false
                }
            ]
        });

        res.status(200).json(personnages);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des personnages." });
    }
}

async function obtenirPersonnageParId(req, res) {
    try {
        const { id } = req.params;
        const personnage = await Personnage.findByPk(id, {
            include: [
                { model: Faction },
                { model: Groupe },
                { model: Planete },
                { model: Pouvoir },
                { model: Vehicule },
                { model: Equipement },
                {
                    model: Attribut,
                    where: { entiteType: 'Personnage' },
                    required: false
                },
                {
                    model: Image,
                    where: { entiteType: 'Personnage' },
                    required: false
                }
            ]
        });

        if (!personnage) {
            return res.status(404).json({ message: "Personnage non trouvé." });
        }

        res.status(200).json(personnage);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du personnage." });
    }
}

async function supprimerPersonnage(req, res) {
    try {
        const personnage = await Personnage.findByPk(req.params.id, {
            include: [{ model: Image, where: { entiteType: 'Personnage' }, required: false }]
        });

        if (!personnage) {
            return res.status(404).json({ message: "Personnage non trouvé" });
        }

        // Supprimer images et attributs associés
        await supprimerImagesEtAttributsParEntite('Personnage', personnage.id);

        // Supprimer le personnage
        await personnage.destroy();

        res.status(200).json({ message: "Personnage supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression personnage :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
async function mettreAJourPersonnage(req, res) {
    try {
        const { id } = req.params;
        const {
            nom, descriptif, stats, factions, groupes,
            planetes, pouvoirs, vehicules, equipements, attributs
        } = req.body;

        const personnage = await Personnage.findByPk(id, {
            include: [
                { model: Faction },
                { model: Groupe },
                { model: Planete },
                { model: Pouvoir },
                { model: Vehicule },
                { model: Equipement },
                { model: Attribut },
                { model: Image }
            ]
        });

        if (!personnage) {
            return res.status(404).json({ message: "Personnage non trouvé." });
        }

        // Mise à jour des informations du personnage
        await personnage.update({
            nom,
            descriptif,
            stats: stats ? JSON.parse(stats) : null
        });

        // Mise à jour des associations many-to-many
        if (factions) await personnage.setFactions(JSON.parse(factions));
        if (groupes) await personnage.setGroupes(JSON.parse(groupes));
        if (planetes) await personnage.setPlanetes(JSON.parse(planetes));
        if (pouvoirs) await personnage.setPouvoirs(JSON.parse(pouvoirs));
        if (vehicules) await personnage.setVehicules(JSON.parse(vehicules));
        if (equipements) await personnage.setEquipements(JSON.parse(equipements));

        // Mise à jour des attributs dynamiques (one-to-many)
        if (attributs) {
            // Supprimer les anciens attributs avant de créer les nouveaux
            await Attribut.destroy({ where: { entiteId: personnage.id, entiteType: 'Personnage' } });

            const parsedAttributs = JSON.parse(attributs);
            for (const attr of parsedAttributs) {
                await Attribut.create({
                    entiteId: personnage.id,
                    entiteType: 'Personnage',
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Mise à jour des images (upload via req.files)
        const images = req.files?.['images'] ?? [];
        if (images.length > 0) {
            // Supprimer les anciennes images sur disque
            for (const img of personnage.Images ?? []) {
                const imagePath = path.join(__dirname, '../../uploads/personnages', path.basename(img.url));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                await img.destroy();
            }

            // Ajouter les nouvelles images
            for (const file of images) {
                await Image.create({
                    entiteId: personnage.id,
                    entiteType: 'Personnage',
                    url: `uploads/personnages/${file.filename}`,
                    type: 'principal'
                });
            }
        }

        // Récupérer le personnage mis à jour avec ses associations
        const updatedPersonnage = await Personnage.findByPk(id, {
            include: [
                { model: Faction },
                { model: Groupe },
                { model: Planete },
                { model: Pouvoir },
                { model: Vehicule },
                { model: Equipement },
                { model: Attribut },
                { model: Image }
            ]
        });

        res.status(200).json(updatedPersonnage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du personnage." });
    }
}


module.exports = {
    creerPersonnage,
    obtenirTousLesPersonnages,
    obtenirPersonnageParId,
    supprimerPersonnage,
    mettreAJourPersonnage
};
