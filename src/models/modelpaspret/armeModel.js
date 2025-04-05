module.exports = (sequelize, DataTypes) => {
    const Arme = sequelize.define('Arme', {
        nom: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT }
    });

    return Arme;
};
