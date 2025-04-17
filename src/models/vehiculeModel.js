module.exports = (sequelize, DataTypes) => {
    const Vehicule = sequelize.define('Vehicule', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Vehicule.associate = (models) => {
        // Attributs dynamiques
        Vehicule.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Vehicule'
            },
            as: 'attributs'
        });

        // Images liées
        Vehicule.hasMany(models.Image, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Vehicule'
            },
            as: 'images'
        });

        // Relation many-to-many avec Personnage
        Vehicule.belongsToMany(models.Personnage, {
            through: 'PersonnageVehicule',
            as: 'personnages'
        });
    };

    return Vehicule;
};
