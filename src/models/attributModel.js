module.exports = (sequelize, DataTypes) => {
    const Attribut = sequelize.define('Attribut', {
        entiteType: { type: DataTypes.STRING, allowNull: false }, // 'Personnage', 'Vehicule', etc.
        entiteId: { type: DataTypes.INTEGER, allowNull: false },
        nom: { type: DataTypes.STRING, allowNull: false },
        valeur: { type: DataTypes.STRING }
    });

    return Attribut;
};

