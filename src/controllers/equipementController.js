const { Equipement, Attribut, Image, Personnage } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

// Utilitaire : Génère l'URL relative à stocker en BDD
const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file); // exemple : src/uploads/images/equipement/
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename); // format compatible BDD
};

async function creerEquipement(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const imagePrincipale = req.files.imagePrincipale ? req.files.imagePrincipale[0] : null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        // Créer l'équipement dans la base de données
        const equipement = await Equipement.create({ nom, description });

        // Ajouter les attributs dynamiques
        if (attributs) {
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Ajouter l'image principale
        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Equipement',
                entiteId: equipement.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        // Ajouter les images secondaires
        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Equipement',
                entiteId: equipement.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        // Ajouter les personnages associés
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await equipement.addPersonnage(personnage);
            }
        }

        res.status(201).json(equipement);
    } catch (error) {
        console.error("Erreur création équipement :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de l'équipement." });
    }
}

async function obtenirTousLesEquipements(req, res) {
    try {
        const equipements = await Equipement.findAll({
            include: [
                {
                    model: Personnage,
                    as: 'personnages'
                },
                {
                    model: Attribut,
                    as: 'attributs', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Equipement' },
                    required: false // Les attributs sont facultatifs
                },
                {
                    model: Image,
                    as: 'images', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Equipement' },
                    required: false // Les images sont facultatives
                }
            ]
        });
        res.status(200).json(equipements);
    } catch (error) {
        console.error("Erreur récupération équipements :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirEquipementParId(req, res) {
    try {
        const equipement = await Equipement.findByPk(req.params.id, {
            include: [
                {
                    model: Attribut,
                    as: 'attributs', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Equipement' },
                    required: false // Les attributs sont facultatifs
                },
                {
                    model: Image,
                    as: 'images', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Equipement' },
                    required: false // Les images sont facultatives
                },
                {
                    model: Personnage,
                    as: 'personnages', // 👈 Assurez-vous que l'alias est correct
                    through: { attributes: [] } // Si vous n'avez pas de colonne intermédiaire, vous pouvez l'omettre
                }
            ]
        });

        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        res.status(200).json(equipement);
    } catch (error) {
        console.error("Erreur récupération équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function mettreAJourEquipement(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const equipement = await Equipement.findByPk(req.params.id);
        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        await equipement.update({ nom, description });

        // Mise à jour des attributs dynamiques
        if (attributs) {
            await Attribut.destroy({ where: { entiteId: equipement.id, entiteType: 'Equipement' } });
            const attributsArray = JSON.parse(attributs);
            for (const attr of attributsArray) {
                await Attribut.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    nom: attr.nom,
                    valeur: attr.valeur
                });
            }
        }

        // Suppression des anciennes images (fichiers + DB)
        const imagesExistantes = await Image.findAll({
            where: { entiteType: 'Equipement', entiteId: equipement.id }
        });

        for (const image of imagesExistantes) {
            const imagePath = resolveUploadPathFromDB(image);
            console.log(`Suppression image : ${imagePath}`);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log("Fichier supprimé du serveur.");
            } else {
                console.log(`Fichier introuvable : ${imagePath}`);
            }

            await image.destroy();
        }

        // Ajouter une nouvelle image principale
        if (req.files && req.files.imagePrincipale) {
            const imagePrincipale = req.files.imagePrincipale[0];
            await Image.create({
                entiteType: 'Equipement',
                entiteId: equipement.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        // Ajouter de nouvelles images secondaires
        if (req.files && req.files.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Equipement',
                    entiteId: equipement.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        // Mise à jour des personnages associés
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await equipement.setPersonnages([]);  // Réinitialiser la relation
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) {
                    await equipement.addPersonnage(personnage);
                }
            }
        }

        res.status(200).json(equipement);
    } catch (error) {
        console.error("Erreur mise à jour équipement :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'équipement." });
    }
}

async function supprimerEquipement(req, res) {
    try {
        const id = req.params.id;
        const equipement = await Equipement.findByPk(id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!equipement) {
            return res.status(404).json({ message: "Équipement introuvable" });
        }

        // Dissocier les personnages liés (relation many-to-many)
        await equipement.setPersonnages([]);

        // Supprimer les attributs dynamiques
        await Attribut.destroy({
            where: { entiteType: 'Equipement', entiteId: equipement.id }
        });

        // Supprimer les images (fichiers + DB)
        const images = await Image.findAll({
            where: { entiteType: 'Equipement', entiteId: equipement.id }
        });

        for (const image of images) {
            if (image && image.url) {
                const imagePath = resolveUploadPathFromDB(image);

                console.log(`Suppression image : ${imagePath}`);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log("Fichier supprimé du serveur.");
                } else {
                    console.log(`Fichier introuvable : ${imagePath}`);
                }

                await image.destroy();
            } else {
                console.log("Aucun chemin trouvé pour l'image, impossible de la supprimer.");
            }
        }

        // Supprimer l'équipement
        const deleted = await equipement.destroy();

        if (deleted) {
            console.log(`Équipement ${equipement.id} supprimé avec succès`);
            res.status(200).json({ message: 'Équipement supprimé avec succès' });
        } else {
            res.status(400).json({ message: 'Échec de la suppression de l\'équipement' });
        }
    } catch (error) {
        console.error("Erreur suppression équipement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    creerEquipement,
    obtenirTousLesEquipements,
    obtenirEquipementParId,
    mettreAJourEquipement,
    supprimerEquipement
};
