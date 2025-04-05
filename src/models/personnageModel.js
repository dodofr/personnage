module.exports = (sequelize, DataTypes) => {
    const Personnage = sequelize.define('Personnage', {
        nom: { type: DataTypes.STRING, allowNull: false },
        stats: { type: DataTypes.JSON }, // Permet de stocker plusieurs stats (ex: force, intelligence...)
        descriptif: { type: DataTypes.TEXT }
    });

    Personnage.associate = (models) => {
        Personnage.belongsToMany(models.Planete, { through: 'PersonnagePlanete' });
        Personnage.belongsToMany(models.Vehicule, { through: 'PersonnageVehicule' });
        Personnage.belongsToMany(models.Faction, { through: 'PersonnageFaction' });
        Personnage.belongsToMany(models.Pouvoir, { through: 'PersonnagePouvoir' });
        Personnage.belongsToMany(models.Groupe, { through: 'PersonnageGroupe' });
        Personnage.belongsToMany(models.Equipement, { through: 'PersonnageEquipement' }); // ✅ Ajout Equipement

        // Ajout des attributs dynamiques
        Personnage.hasMany(models.Attribut, {
            foreignKey: 'entiteId',
            constraints: false,
            scope: {
                entiteType: 'Personnage'
            }
        });
    };

    return Personnage;
};
