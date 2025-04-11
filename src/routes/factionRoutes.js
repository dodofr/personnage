const upload = require('../upload/upload');
const {
    creerFaction,
    obtenirToutesLesFactions,
    obtenirFactionParId,
    mettreAJourFaction,
    supprimerFaction
} = require('../controllers/factionController');

module.exports = (app) => {
    app.post('/api/factions',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),
        creerFaction
    );

    app.get('/api/factions', obtenirToutesLesFactions);
    app.get('/api/factions/:id', obtenirFactionParId);

    app.put('/api/factions/:id',
        upload.fields([
            { name: 'imagePrincipale', maxCount: 1 },
            { name: 'imagesSecondaires', maxCount: 10 }
        ]),
        mettreAJourFaction
    );

    app.delete('/api/factions/:id', supprimerFaction);
};
