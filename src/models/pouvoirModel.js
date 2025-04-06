module.exports = (sequelize, DataTypes) => {
    const Pouvoir = sequelize.define('Pouvoir', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Pouvoir.associate = (models) => {
        // Attributs dynamiques
        Pouvoir.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Pouvoir'
            },
            as: 'attributs'
        });

        // Images liées
        Pouvoir.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Pouvoir'
            },
            as: 'images'
        });

        // Relation many-to-many avec Personnage
        Pouvoir.belongsToMany(models.Personnage, {
            through: 'PersonnagePouvoir',
            as: 'personnages'
        });
    };

    return Pouvoir;
};
