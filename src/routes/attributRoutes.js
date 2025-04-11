const {
    creer,
    lister,
    listerParType,
    listerParEntite,
    lire,
    modifier,
    supprimer
} = require('../controllers/attributController');

module.exports = (app) => {
    app.post('/api/attributs', creer);
    app.get('/api/attributs', lister);
    app.get('/api/attributs/entite/:type', listerParType);
    app.get('/api/attributs/:id', lire);
    app.get('/api/attributs/entite/:type/:id', listerParEntite);
    app.put('/api/attributs/:id', modifier);
    app.delete('/api/attributs/:id', supprimer);
};
