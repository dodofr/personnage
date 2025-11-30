const upload = require('../../upload/upload');
const { iaConversationPersonnage, iaHistorique } = require('../../controllers/iaController/iaControllerPersonnage');

module.exports = (app) => {
    // Endpoint pour envoyer un message à l'IA
    app.post(
        "/api/ia/personnage",
        upload.fields([]),  // <-- nécessaire pour parser le form-data texte
        iaConversationPersonnage
    );

    // Endpoint pour récupérer l'historique d'une session
    app.get(
        "/api/ia/personnage/historique",
        iaHistorique
    );
};
