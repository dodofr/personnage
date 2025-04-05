module.exports = (sequelize, DataTypes) => {
    const Groupe = sequelize.define("Groupe", {
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        factionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Factions", 
                key: "id"
            },
            onDelete: "CASCADE"
        }
    }, {
        timestamps: true
    });

    Groupe.associate = (models) => {
        Groupe.belongsTo(models.Faction, { foreignKey: "factionId" });
    };

    return Groupe;
};
