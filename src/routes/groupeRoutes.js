const upload = require('../upload/upload');
const {
    creerGroupe,
    obtenirTousLesGroupes,
    obtenirGroupeParId,
    mettreAJourGroupe,
    supprimerGroupe
} = require('../controllers/groupeController');

module.exports = (app) => {
    app.post("/api/groupes", upload.array('images', 10), creerGroupe);
    app.get('/api/groupes', obtenirTousLesGroupes);
    app.get('/api/groupes/:id', obtenirGroupeParId);
    app.put('/api/groupes/:id', upload.array('images', 10), mettreAJourGroupe);
    app.delete('/api/groupes/:id', supprimerGroupe);
};
