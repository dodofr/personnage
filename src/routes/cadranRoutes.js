const upload = require('../upload/upload');
const {
    creerCadran,
    obtenirTousLesCadrans,
    obtenirCadranParId,
    mettreAJourCadran,
    supprimerCadran
} = require("../controllers/cadranController");

module.exports = (app) => {
    app.post("/api/cadrans", upload.single('image'), creerCadran);
    app.get("/api/cadrans", obtenirTousLesCadrans);
    app.get("/api/cadrans/:id", obtenirCadranParId);
    app.put("/api/cadrans/:id", upload.single('image'), mettreAJourCadran);
    app.delete("/api/cadrans/:id", supprimerCadran);
};
