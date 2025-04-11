const getUploadPath = (req, file) => {
    console.log('--- MULTER DEBUG ---');
    console.log('req.originalUrl:', req.originalUrl);
    console.log('file.mimetype:', file.mimetype);

    if (file.mimetype.startsWith('image/')) {
        const segments = req.originalUrl.split('/');
        const entite = segments.includes('planetes') ? 'planete' :
                       segments.includes('personnages') ? 'personnage' :
                       segments.includes('equipements') ? 'equipement' :
                       segments.includes('factions') ? 'faction' :
                       segments.includes('groupes') ? 'groupe' :
                       segments.includes('pouvoirs') ? 'pouvoir' :
                       segments.includes('vehicules') ? 'vehicule' :
                       'autres';

        const finalPath = `src/uploads/images/${entite}/`;
        console.log('Destination image:', finalPath);
        return finalPath;
    } else if (file.mimetype === 'application/pdf') {
        console.log('Destination PDF: src/uploads/documents/');
        return 'src/uploads/documents/';
    }

    console.log('Fichier non supporté');
    return null;
};
module.exports = { getUploadPath };