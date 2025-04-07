module.exports = (sequelize, DataTypes) => {
    const Equipement = sequelize.define('Equipement', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Equipement.associate = (models) => {
        // Attributs dynamiques
        Equipement.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Equipement'
            },
            as: 'attributs'
        });

        // Images liées
        Equipement.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Equipement'
            },
            as: 'images'
        });

        // Relation avec Personnage (un personnage peut posséder plusieurs équipements)
        Equipement.belongsToMany(models.Personnage, {
            through: 'PersonnageEquipement', // Table de liaison
            foreignKey: 'equipementId',
            otherKey: 'personnageId',
            as: 'personnages'
        });
    };

    return Equipement;
};
