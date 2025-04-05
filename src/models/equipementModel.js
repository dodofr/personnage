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
        Equipement.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Equipement'
            }
        });
    };

    return Equipement;
};
