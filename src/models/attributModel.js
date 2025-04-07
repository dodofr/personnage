module.exports = (sequelize, DataTypes) => {
    const Attribut = sequelize.define('Attribut', {
        entiteType: { type: DataTypes.STRING, allowNull: false }, // 'Personnage', 'Vehicule', etc.
        entiteId: { type: DataTypes.INTEGER, allowNull: false },
        nom: { type: DataTypes.STRING, allowNull: false },
        valeur: { type: DataTypes.STRING }
    });

    return Attribut;
};
/* 
Possiblement mieux que celui que j'ai actuellement

module.exports = (sequelize, DataTypes) => {
    const Attribut = sequelize.define('Attribut', {
        entiteType: { type: DataTypes.STRING, allowNull: false }, // 'Personnage', 'Vehicule', etc.
        entiteId: { type: DataTypes.INTEGER, allowNull: false },
        nom: { type: DataTypes.STRING, allowNull: false },
        valeur: { type: DataTypes.STRING }
    });

    Attribut.associate = (models) => {
        // Si tu veux valider la relation entre entité et attribut
        Attribut.belongsTo(models.Personnage, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Personnage' }
        });

        Attribut.belongsTo(models.Vehicule, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: { entiteType: 'Vehicule' }
        });

        // Ajoute des associations si tu prévois d'autres relations
    };

    return Attribut;
};
*/