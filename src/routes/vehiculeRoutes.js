const upload = require('../upload/upload');

const {
    creerVehicule,
    obtenirTousLesVehicules,
    obtenirVehiculeParId,
    mettreAJourVehicule,
    supprimerVehicule
} = require('../controllers/vehiculeController');

module.exports = (app) => {
    app.post('/api/vehicules', upload.array('images', 10), creerVehicule);
    app.get('/api/vehicules', obtenirTousLesVehicules);
    app.get('/api/vehicules/:id', obtenirVehiculeParId);
    app.put('/api/vehicules/:id', upload.array('images', 10), mettreAJourVehicule);
    app.delete('/api/vehicules/:id', supprimerVehicule);
};
