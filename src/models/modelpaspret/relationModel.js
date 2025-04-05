module.exports = (sequelize, DataTypes) => {
    const relations = {};

    // Table de jointure entre Personnage et Planète
    relations.PersonnagePlanete = sequelize.define('PersonnagePlanete', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        planeteId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Planetes',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Arme
    relations.PersonnageArme = sequelize.define('PersonnageArme', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        armeId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Armes',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Véhicule
    relations.PersonnageVehicule = sequelize.define('PersonnageVehicule', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        vehiculeId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Vehicules',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Faction
    relations.PersonnageFaction = sequelize.define('PersonnageFaction', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        factionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Factions',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Pouvoir
    relations.PersonnagePouvoir = sequelize.define('PersonnagePouvoir', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        pouvoirId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Pouvoirs',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Groupe (Organisation)
    relations.PersonnageGroupe = sequelize.define('PersonnageGroupe', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        groupeId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Groupes',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Technologie
    relations.PersonnageTechnologie = sequelize.define('PersonnageTechnologie', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        technologieId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Technologies',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Langue
    relations.PersonnageLangue = sequelize.define('PersonnageLangue', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        langueId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Langues',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Personnage et Conflit
    relations.PersonnageConflit = sequelize.define('PersonnageConflit', {
        personnageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Personnages',
                key: 'id'
            }
        },
        conflitId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Conflits',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Faction et Technologie
    relations.FactionTechnologie = sequelize.define('FactionTechnologie', {
        factionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Factions',
                key: 'id'
            }
        },
        technologieId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Technologies',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Faction et Langue
    relations.FactionLangue = sequelize.define('FactionLangue', {
        factionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Factions',
                key: 'id'
            }
        },
        langueId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Langues',
                key: 'id'
            }
        }
    });

    // Table de jointure entre Faction et Conflit
    relations.FactionConflit = sequelize.define('FactionConflit', {
        factionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Factions',
                key: 'id'
            }
        },
        conflitId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Conflits',
                key: 'id'
            }
        }
    });

    return relations;
};
