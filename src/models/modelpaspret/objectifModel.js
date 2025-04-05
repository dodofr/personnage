module.exports = (sequelize, DataTypes) => {
    const Objectif = sequelize.define('Objectif', {
        missionId: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT },
        status: { type: DataTypes.STRING, defaultValue: "en cours" }
    });

    return Objectif;
};
