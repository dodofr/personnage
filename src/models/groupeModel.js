module.exports = (sequelize, DataTypes) => {
    const Groupe = sequelize.define('Groupe', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Groupe.associate = (models) => {
        // Attributs dynamiques
        Groupe.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Groupe' },
            as: 'attributs'
        });

        // Images
        Groupe.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Groupe' },
            as: 'images'
        });

        // Appartenance à une faction
        Groupe.belongsTo(models.Faction, {
            foreignKey: 'FactionId',
            as: 'faction'
        });

        // Personnages associés
        Groupe.belongsToMany(models.Personnage, {
            through: 'PersonnageGroupe',
            as: 'personnages'
        });
    };

    return Groupe;
};
