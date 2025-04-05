module.exports = (sequelize, DataTypes) => {
    const HistoriqueAttribut = sequelize.define("HistoriqueAttribut", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        personnageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Personnages", // Nom de la table associée
                key: "id"
            },
            onDelete: "CASCADE"
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ancienneValeur: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nouvelleValeur: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dateModification: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    HistoriqueAttribut.associate = (models) => {
        HistoriqueAttribut.belongsTo(models.Personnage, { foreignKey: "personnageId" });
    };

    return HistoriqueAttribut;
};
