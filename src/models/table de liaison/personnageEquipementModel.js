// src/models/personnageEquipementModel.js
module.exports = (sequelize, DataTypes) => {
    const PersonnageEquipement = sequelize.define('PersonnageEquipement', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnage', // Référence à la table Personnage
                key: 'id'
            },
            allowNull: false
        },
        equipementId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Equipement', // Référence à la table Equipement
                key: 'id'
            },
            allowNull: false
        }
    });

    return PersonnageEquipement;
};
