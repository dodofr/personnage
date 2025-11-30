const { Sequelize, DataTypes } = require("sequelize");

// Importer les modèles encore utilisés
const PersonnageModel = require("../models/personnageModel");
const PlaneteModel = require("../models/planeteModel");
const VehiculeModel = require("../models/vehiculeModel");
const FactionModel = require("../models/factionModel");
const GroupeModel = require("../models/groupeModel");
const PouvoirModel = require("../models/pouvoirModel");
const AttributModel = require("../models/attributModel");
const EquipementModel = require("../models/equipementModel");
const ImageModel = require("../models/imageModel");

//import tables de liason, pas besoin de table de liaison car se creer automatiquement avec les associations
//const PersonnageEquipementModel = require('../models/table de liaison/personnageEquipementModel');

// Créer la connexion à la base de données MariaDB
const sequelize = new Sequelize(`mariadb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    dialectOptions: {
        connectTimeout: 60000,
    }
});

// Initialisation des modèles
const Personnage = PersonnageModel(sequelize, DataTypes);
const Planete = PlaneteModel(sequelize, DataTypes);
const Vehicule = VehiculeModel(sequelize, DataTypes);
const Faction = FactionModel(sequelize, DataTypes);
const Groupe = GroupeModel(sequelize, DataTypes);
const Pouvoir = PouvoirModel(sequelize, DataTypes);
const Attribut = AttributModel(sequelize, DataTypes);
const Equipement = EquipementModel(sequelize, DataTypes);
const Image = ImageModel(sequelize, DataTypes);
//const PersonnageEquipement = PersonnageEquipementModel(sequelize, DataTypes);

// Regrouper les modèles dans un objet pour les associations
const models = {
    Personnage,
    Planete,
    Vehicule,
    Faction,
    Groupe,
    Pouvoir,
    Attribut,
    Equipement,
    Image,
    //PersonnageEquipement,
};

// Appliquer les méthodes associate() pour chaque modèle en allant lire dans le modele
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Fonction d'initialisation de la base de données
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connexion à la base de données réussie.");
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;'); //tout supprimer si clef etrangere deja presente
        await sequelize.sync({ force: true }); // force: false creer que ce qui manque et true pour supprimer les tables et donnée
        console.log("La base de données a bien été initialisée !");
    } catch (error) {
        console.error("Erreur lors de la connexion à la base de données :", error);
    }
};

module.exports = {
    initDb,
    sequelize,
    ...models
};
