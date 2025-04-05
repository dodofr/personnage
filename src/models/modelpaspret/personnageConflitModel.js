module.exports = (sequelize, DataTypes) => {
    const PersonnageConflit = sequelize.define("PersonnageConflit", {
        personnageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Personnages", 
                key: "id"
            },
            onDelete: "CASCADE"
        },
        conflitId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Conflits", 
                key: "id"
            },
            onDelete: "CASCADE"
        },
        role: {
            type: DataTypes.STRING, // Ex: participant, leader, antagoniste
            allowNull: true
        }
    }, {
        timestamps: false
    });

    return PersonnageConflit;
};
