const upload = require('../upload/upload');
const {
    creerFaction,
    obtenirToutesLesFactions,
    obtenirFactionParId,
    mettreAJourFaction,
    supprimerFaction
} = require('../controllers/factionController');

module.exports = (app) => {
    app.post("/api/factions", upload.array('images', 10), creerFaction);
    app.get('/api/factions', obtenirToutesLesFactions);
    app.get('/api/factions/:id', obtenirFactionParId);
    app.put('/api/factions/:id', upload.array('images', 10), mettreAJourFaction);
    app.delete('/api/factions/:id', supprimerFaction);
};
