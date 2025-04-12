const { Personnage, Attribut, Image, Planete, Vehicule, Faction, Pouvoir, Groupe, Equipement } = require('../db/sequelize');
const { resolveUploadPathFromDB } = require('../utils/fileHelper');
const { getUploadPath } = require('../utils/getUploadPath');
const fs = require('fs');
const path = require('path');
const { verifyOrCreate } = require('../utils/verifyOrCreate');

const pathForDB = (file, req) => {
    const fullPath = getUploadPath(req, file);
    const relativeDir = fullPath.replace(/^src[\\/]/, 'uploads/');
    return path.posix.join(relativeDir, file.filename);
};

const creerPersonnage = async (req, res) => {
    try {
      const { nom, descriptif } = req.body;
  
      const imagePrincipale = req.files.imagePrincipale ? req.files.imagePrincipale[0] : null;
      const imagesSecondaires = req.files.imagesSecondaires || [];
  
      // Parser les champs relationnels et attributs
      const parsedPlanetes = JSON.parse(req.body.planetes || '[]');
      const parsedVehicules = JSON.parse(req.body.vehicules || '[]');
      const parsedFactions = JSON.parse(req.body.factions || '[]');
      const parsedPouvoirs = JSON.parse(req.body.pouvoirs || '[]');
      const parsedGroupes = JSON.parse(req.body.groupes || '[]');
      const parsedEquipements = JSON.parse(req.body.equipements || '[]');
      const parsedAttributs = JSON.parse(req.body.attributs || '[]');
  
      // Parser les stats si elles sont envoyées en tant que string
      const parsedStats = JSON.parse(req.body.stats || '[]');
      console.log(parsedStats)
      // Créer le personnage avec les stats JSON parsées
      const personnage = await Personnage.create({ nom, descriptif, stats: parsedStats });
      await personnage.reload();
  
      // Fonction générique pour sécuriser les associations
      const safeMap = async (model, noms) =>
        (await Promise.all(noms.map(nom => verifyOrCreate(model, nom))))
          .filter(e => e !== null && e !== undefined);
  
      // Associations
      const planetesAssociations = await safeMap(Planete, parsedPlanetes);
      const vehiculesAssociations = await safeMap(Vehicule, parsedVehicules);
      const factionsAssociations = await safeMap(Faction, parsedFactions);
      const pouvoirsAssociations = await safeMap(Pouvoir, parsedPouvoirs);
      const groupesAssociations = await safeMap(Groupe, parsedGroupes);
      const equipementsAssociations = await safeMap(Equipement, parsedEquipements);
  
      await personnage.setPlanetes(planetesAssociations);
      await personnage.setVehicules(vehiculesAssociations);
      await personnage.setFactions(factionsAssociations);
      await personnage.setPouvoirs(pouvoirsAssociations);
      await personnage.setGroupes(groupesAssociations);
      await personnage.setEquipements(equipementsAssociations);
  
      // Attributs dynamiques
      if (Array.isArray(parsedAttributs)) {
        for (const attr of parsedAttributs) {
          await Attribut.create({
            nom: attr.nom,
            valeur: attr.valeur,
            entiteType: 'personnage',
            entiteId: personnage.id
          });
        }
      }
  
      // Images
      if (imagePrincipale) {
        await Image.create({
          entiteType: 'Personnage',
          entiteId: personnage.id,
          url: `/${pathForDB(imagePrincipale, req)}`,
          type: 'principale'
        });
      }
  
      for (const file of imagesSecondaires) {
        await Image.create({
          entiteType: 'Personnage',
          entiteId: personnage.id,
          url: `/${pathForDB(file, req)}`,
          type: 'secondaire'
        });
      }
  
      // On renvoie les stats déjà sous forme de tableau
      res.status(201).json({ message: 'Personnage créé avec succès', personnage: { ...personnage.toJSON(), stats: parsedStats } });
  
    } catch (error) {
      console.error('Erreur lors de la création du personnage :', error);
      res.status(500).json({ message: "Erreur lors de la création du personnage", erreur: error.message });
    }
  };
  


async function obtenirTousLesPersonnages(req, res) {
    try {
        const personnages = await Personnage.findAll({
            include: [
              { model: Attribut, where: { entiteType: 'Personnage' }, required: false },
              { model: Image, as: 'images', required: false }, // ⚠️ ici : alias "images"
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
              { model: Image, as: 'images', required: false }, // ⚠️ alias ici aussi
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
      const personnage = await Personnage.findByPk(req.params.id);
      if (!personnage) return res.status(404).json({ message: "Personnage introuvable" });
  
      const { nom, descriptif } = req.body;
  
      const imagePrincipale = req.files.imagePrincipale ? req.files.imagePrincipale[0] : null;
      const imagesSecondaires = req.files.imagesSecondaires || [];
  
      // Parse des données
      const parsedStats = JSON.parse(req.body.stats || '[]');
      const parsedAttributs = JSON.parse(req.body.attributs || '[]');
      const parsedPlanetes = JSON.parse(req.body.planetes || '[]');
      const parsedVehicules = JSON.parse(req.body.vehicules || '[]');
      const parsedFactions = JSON.parse(req.body.factions || '[]');
      const parsedPouvoirs = JSON.parse(req.body.pouvoirs || '[]');
      const parsedGroupes = JSON.parse(req.body.groupes || '[]');
      const parsedEquipements = JSON.parse(req.body.equipements || '[]');
  
      // Update du personnage
      await personnage.update({ nom, descriptif, stats: parsedStats });
  
      // Suppression des anciens attributs
      await Attribut.destroy({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
  
      // Ajout des nouveaux attributs
      for (const attr of parsedAttributs) {
        await Attribut.create({
          entiteType: 'Personnage',
          entiteId: personnage.id,
          nom: attr.nom,
          valeur: attr.valeur
        });
      }
  
      // Suppression des anciennes images
      const images = await Image.findAll({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
      for (const image of images) {
        const imagePath = resolveUploadPathFromDB(image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        await image.destroy();
      }
  
      // Ajout des nouvelles images
      if (imagePrincipale) {
        await Image.create({
          entiteType: 'Personnage',
          entiteId: personnage.id,
          url: `/${pathForDB(imagePrincipale, req)}`,
          type: 'principale'
        });
      }
  
      for (const file of imagesSecondaires) {
        await Image.create({
          entiteType: 'Personnage',
          entiteId: personnage.id,
          url: `/${pathForDB(file, req)}`,
          type: 'secondaire'
        });
      }
  
      // Réinitialisation des relations
      await personnage.setPlanetes([]);
      await personnage.setVehicules([]);
      await personnage.setFactions([]);
      await personnage.setPouvoirs([]);
      await personnage.setGroupes([]);
      await personnage.setEquipements([]);
  
      // Fonction générique sécurisée
      const safeMap = async (model, noms) =>
        (await Promise.all(noms.map(nom => verifyOrCreate(model, nom))))
          .filter(e => e !== null && e !== undefined);
  
      // Associations
      const planetesAssociations = await safeMap(Planete, parsedPlanetes);
      const vehiculesAssociations = await safeMap(Vehicule, parsedVehicules);
      const factionsAssociations = await safeMap(Faction, parsedFactions);
      const pouvoirsAssociations = await safeMap(Pouvoir, parsedPouvoirs);
      const groupesAssociations = await safeMap(Groupe, parsedGroupes);
      const equipementsAssociations = await safeMap(Equipement, parsedEquipements);
  
      await personnage.setPlanetes(planetesAssociations);
      await personnage.setVehicules(vehiculesAssociations);
      await personnage.setFactions(factionsAssociations);
      await personnage.setPouvoirs(pouvoirsAssociations);
      await personnage.setGroupes(groupesAssociations);
      await personnage.setEquipements(equipementsAssociations);
  
      res.status(200).json({ message: "Personnage mis à jour", personnage });
  
    } catch (error) {
      console.error("Erreur mise à jour personnage :", error);
      res.status(500).json({ message: "Erreur serveur", erreur: error.message });
    }
  }
  

  async function supprimerPersonnage(req, res) {
    try {
      const personnage = await Personnage.findByPk(req.params.id);
      if (!personnage) return res.status(404).json({ message: "Personnage introuvable" });
  
      // Relations
      await personnage.setPlanetes([]);
      await personnage.setVehicules([]);
      await personnage.setFactions([]);
      await personnage.setPouvoirs([]);
      await personnage.setGroupes([]);
      await personnage.setEquipements([]);
  
      // Attributs dynamiques
      await Attribut.destroy({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
  
      // Suppression des fichiers image
      const images = await Image.findAll({ where: { entiteType: 'Personnage', entiteId: personnage.id } });
      for (const image of images) {
        const imagePath = resolveUploadPathFromDB(image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        await image.destroy();
      }
  
      // Suppression du personnage
      await personnage.destroy();
  
      res.status(200).json({ message: "Personnage supprimé avec succès" });
  
    } catch (error) {
      console.error("Erreur suppression personnage :", error);
      res.status(500).json({ message: "Erreur serveur", erreur: error.message });
    }
  }
  

module.exports = {
    creerPersonnage,
    obtenirTousLesPersonnages,
    obtenirPersonnageParId,
    mettreAJourPersonnage,
    supprimerPersonnage
};
