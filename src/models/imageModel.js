module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        entiteId: { type: DataTypes.INTEGER, allowNull: false },
        entiteType: { type: DataTypes.STRING, allowNull: false }, // Ex: 'Personnage', 'Planete'
        url: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING } // Principal, secondaire...
    });

    return Image;
};
