module.exports = (sequelize, DataTypes) => {
    const Evenement = sequelize.define('Evenement', {
        titre: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        date: { type: DataTypes.DATE }
    });

    Evenement.associate = (models) => {
        Evenement.belongsToMany(models.Personnage, { through: 'PersonnageEvenement' });
    };

    return Evenement;
};
