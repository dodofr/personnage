const upload = require('../../upload/upload');
const { iaConversationPersonnage } = require('../../controllers/iaController/iaControllerPersonnage');
module.exports = (app) => {
    app.post(
        "/api/ia/personnage",
        upload.fields([]),  // <-- important pour parser le form-data texte
        iaConversationPersonnage
    );
};
