const {
    creer,
    lister,
    lire,
    modifier,
    supprimer,
    listerParEntite
} = require('../controllers/attributController');

module.exports = (app) => {
    // Créer un attribut
    app.post('/api/attributs', creer);

    // Lister tous les attributs ou filtrer par entité via query string
    // Exemple : /api/attributs?entiteType=Personnage&entiteId=1
    app.get('/api/attributs', lister);

    // Lister les attributs d'une entité spécifique via l’URL
    // Exemple : /api/attributs/Personnage/1/attributs
    app.get('/api/attributs/:type/:id/attributs', listerParEntite);

    // Lire un attribut par ID
    app.get('/api/attributs/:id', lire);

    // Modifier un attribut
    app.put('/api/attributs/:id', modifier);

    // Supprimer un attribut
    app.delete('/api/attributs/:id', supprimer);
};
