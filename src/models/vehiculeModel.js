module.exports = (sequelize, DataTypes) => {
    const Vehicule = sequelize.define('Vehicule', {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Vehicule.associate = (models) => {
        Vehicule.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Vehicule'
            }
        });
    };

    return Vehicule;
};
