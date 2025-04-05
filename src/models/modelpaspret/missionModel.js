module.exports = (sequelize, DataTypes) => {
    const Mission = sequelize.define('Mission', {
        nom: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        statut: { type: DataTypes.STRING, defaultValue: "En cours" }
    });

    Mission.associate = (models) => {
        Mission.belongsToMany(models.Personnage, { through: 'PersonnageMission' });
        Mission.hasMany(models.Objectif);
    };

    return Mission;
};
