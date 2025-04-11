const path = require('path');

const resolveUploadPathFromDB = (image) => {
    const entite = image.entiteType.toLowerCase();
    const filename = path.basename(image.url).toLowerCase(); // important

    const isPDF = filename.endsWith('.pdf');

    if (isPDF) {
        return path.join(__dirname, '..', 'uploads', 'documents', filename);
    }

    const dossiers = ['personnage', 'equipement', 'faction', 'groupe', 'planete', 'pouvoir', 'vehicule'];
    const dossier = dossiers.includes(entite) ? entite : 'autres';

    return path.join(__dirname, '..', 'uploads', 'images', dossier, filename);
};

module.exports = { resolveUploadPathFromDB };
