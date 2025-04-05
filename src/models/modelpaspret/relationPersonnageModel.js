module.exports = (sequelize, DataTypes) => {
    const RelationPersonnage = sequelize.define('RelationPersonnage', {
        personnageId1: { type: DataTypes.INTEGER, allowNull: false },
        personnageId2: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING }, // Ex: Frère, Ennemi...
        description: { type: DataTypes.TEXT }
    });

    return RelationPersonnage;
};
