module.exports = (sequelize, DataTypes) => {
    const Planete = sequelize.define('Planete', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Planete.associate = (models) => {
        // Attributs dynamiques
        Planete.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Planete' },
            as: 'attributs'
        });

        // Images
        Planete.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Planete' },
            as: 'images'
        });

        // Lien avec Personnage
        Planete.belongsToMany(models.Personnage, {
            through: 'PersonnagePlanete',
            as: 'personnages'
        });
    };

    return Planete;
};
