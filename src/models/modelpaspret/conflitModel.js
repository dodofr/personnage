module.exports = (sequelize, DataTypes) => {
    const Conflit = sequelize.define("Conflit", {
        titre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        dateDebut: {
            type: DataTypes.DATE,
            allowNull: false
        },
        dateFin: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true
    });

    return Conflit;
};
