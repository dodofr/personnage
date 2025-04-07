module.exports = (sequelize, DataTypes) => {
    const Faction = sequelize.define('Faction', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Faction.associate = (models) => {
        // Attributs dynamiques
        Faction.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Faction' },
            as: 'attributs'
        });

        // Images
        Faction.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Faction' },
            as: 'images'
        });

        // Personnages associés
        Faction.belongsToMany(models.Personnage, {
            through: 'PersonnageFaction',
            as: 'personnages'
        });

        // Groupes associés
        Faction.hasMany(models.Groupe, {
            foreignKey: 'FactionId',
            as: 'groupes'
        });
    };

    return Faction;
};
