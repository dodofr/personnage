module.exports = (sequelize, DataTypes) => {
    const Faction = sequelize.define('Faction', {
        nom: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.TEXT },
        parentId: { type: DataTypes.INTEGER, allowNull: true }
    });

    Faction.associate = (models) => {
       // Une faction peut avoir plusieurs sous-factions (groupes)
       Faction.hasMany(models.Faction, { foreignKey: "parentId" });

       // Une faction peut avoir plusieurs groupes
       Faction.hasMany(models.Groupe, { foreignKey: "factionId" });
    };

    return Faction;
};
