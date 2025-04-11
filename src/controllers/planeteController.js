const { Planete, Attribut, Image, Personnage } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');

// Utilitaire : Génère l'URL relative à stocker en BDD
const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file); // exemple : src/uploads/images/planete/
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename); // format compatible BDD
};

async function creerPlanete(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;
        const imagePrincipale = req.files.imagePrincipale ? req.files.imagePrincipale[0] : null;
        const imagesSecondaires = req.files.imagesSecondaires || [];

        const planete = await Planete.create({ nom, description });

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

        if (imagePrincipale) {
            await Image.create({
                entiteType: 'Planete',
                entiteId: planete.id,
                url: `/${pathForDB(imagePrincipale, req)}`,
                type: 'principale'
            });
        }

        for (const file of imagesSecondaires) {
            await Image.create({
                entiteType: 'Planete',
                entiteId: planete.id,
                url: `/${pathForDB(file, req)}`,
                type: 'secondaire'
            });
        }

        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            for (const personnageId of personnagesArray) {
                const personnage = await Personnage.findByPk(personnageId);
                if (personnage) await planete.addPersonnage(personnage);
            }
        }

        res.status(201).json(planete);
    } catch (error) {
        console.error("Erreur création planète :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function obtenirToutesLesPlanetes(req, res) {
    try {
        const planetes = await Planete.findAll({
            include: [
                {
                    model: Personnage,
                    as: 'personnages'
                },
                {
                    model: Attribut,
                    as: 'attributs', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Planete' },
                    required: false // Les attributs sont facultatifs
                },
                {
                    model: Image,
                    as: 'images', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Planete' },
                    required: false // Les images sont facultatives
                }
            ]
        });
        res.status(200).json(planetes);
    } catch (error) {
        console.error("Erreur récupération planètes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}


async function obtenirPlaneteParId(req, res) {
    try {
        const planete = await Planete.findByPk(req.params.id, {
            include: [
                {
                    model: Attribut,
                    as: 'attributs', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Planete' },
                    required: false // Les attributs sont facultatifs
                },
                {
                    model: Image,
                    as: 'images', // 👈 Assurez-vous que l'alias est correct
                    where: { entiteType: 'Planete' },
                    required: false // Les images sont facultatives
                },
                {
                    model: Personnage,
                    as: 'personnages', // 👈 Assurez-vous que l'alias est correct
                    through: { attributes: [] } // Si vous n'avez pas de colonne intermédiaire, vous pouvez l'omettre
                }
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
}



async function mettreAJourPlanete(req, res) {
    try {
        const { nom, description, attributs, personnages } = req.body;

        const planete = await Planete.findByPk(req.params.id);
        if (!planete) {
            return res.status(404).json({ message: "Planète introuvable" });
        }

        await planete.update({ nom, description });

        // Mise à jour des attributs dynamiques
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

        // Suppression des anciennes images (fichiers + DB)
        const imagesExistantes = await Image.findAll({
            where: { entiteType: 'Planete', entiteId: planete.id }
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

        // Nouvelle image principale
        if (req.files && req.files.imagePrincipale) {
            const imagePrincipale = req.files.imagePrincipale[0];
            await Image.create({
                entiteType: 'Planete',
                entiteId: planete.id,
                url: `/${pathForDB(imagePrincipale, req)}`, // Utilisation correcte du chemin relatif
                type: 'principale'
            });
        }

        // Nouvelles images secondaires
        if (req.files && req.files.imagesSecondaires) {
            for (const file of req.files.imagesSecondaires) {
                await Image.create({
                    entiteType: 'Planete',
                    entiteId: planete.id,
                    url: `/${pathForDB(file, req)}`,
                    type: 'secondaire'
                });
            }
        }

        // Mise à jour des personnages liés
        if (personnages) {
            const personnagesArray = JSON.parse(personnages);
            await planete.setPersonnages([]);  // Réinitialise la relation
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
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la planète." });
    }
}




async function supprimerPlanete(req, res) {
    try {
        const id = req.params.id;
        const planete = await Planete.findByPk(id, {
            include: [{ model: Personnage, as: 'personnages' }]
        });

        if (!planete) {
            return res.status(404).json({ message: "Planète introuvable" });
        }

        // Dissocier les personnages liés (nécessaire si relation many-to-many)
        await planete.setPersonnages([]);

        // Supprimer les attributs dynamiques
        await Attribut.destroy({
            where: { entiteType: 'Planete', entiteId: planete.id }
        });

        // Supprimer les images (fichiers + DB)
        const images = await Image.findAll({
            where: { entiteType: 'Planete', entiteId: planete.id }
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
        
        

        // Supprimer la planète
        const deleted = await planete.destroy();

        if (deleted) {
            console.log(`Planète ${planete.id} supprimée avec succès`);
            return res.status(200).json({ message: "Planète supprimée avec succès" });
        } else {
            console.log(`Échec suppression de la planète ${planete.id}`);
            return res.status(500).json({ message: "La planète n'a pas pu être supprimée" });
        }

    } catch (error) {
        console.error("Erreur suppression planète :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
}



// Export regroupé (comme pour personnage)
module.exports = {
    creerPlanete,
    obtenirToutesLesPlanetes,
    obtenirPlaneteParId,
    mettreAJourPlanete,
    supprimerPlanete
};
