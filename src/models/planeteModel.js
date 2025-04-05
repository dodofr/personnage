module.exports = (sequelize, DataTypes) => {
    const Planete = sequelize.define('Planete', {
        nom: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.TEXT }
    });
    Planete.associate = (models) => {
        Planete.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Planete'
            }
        });
    };    

    return Planete;
};
