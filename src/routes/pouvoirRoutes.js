const upload = require('../upload/upload');
const {
    creerPouvoir,
    obtenirTousLesPouvoirs,
    obtenirPouvoirParId,
    mettreAJourPouvoir,
    supprimerPouvoir
} = require('../controllers/pouvoirController');

module.exports = (app) => {
    app.post("/api/pouvoirs", upload.array('images', 10), creerPouvoir);
    app.get("/api/pouvoirs", obtenirTousLesPouvoirs);
    app.get("/api/pouvoirs/:id", obtenirPouvoirParId);
    app.put("/api/pouvoirs/:id", upload.array('images', 10), mettreAJourPouvoir);
    app.delete("/api/pouvoirs/:id", supprimerPouvoir);
};
