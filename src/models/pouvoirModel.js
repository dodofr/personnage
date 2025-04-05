module.exports = (sequelize, DataTypes) => {
    const Pouvoir = sequelize.define('Pouvoir', {
        nom: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT }
    });

    return Pouvoir;
};
