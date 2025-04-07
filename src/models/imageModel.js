module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        entiteId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        entiteType: {
            type: DataTypes.STRING,
            allowNull: false
        }, // Ex: 'Personnage', 'Equipement', etc.
        nom: {
            type: DataTypes.STRING
        },
        url: { // anciennement "chemin"
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING // 'principal', 'secondaire', etc.
        }
    });

    return Image;
};
