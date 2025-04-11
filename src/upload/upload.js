const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dictionnaire des dossiers (clé = nom dans l'URL, valeur = dossier final)
const dossierMap = {
    personnages: 'personnage',
    equipements: 'equipement',
    factions: 'faction',
    groupes: 'groupe',
    planetes: 'planete',
    pouvoirs: 'pouvoir',
    vehicules: 'vehicule',
};

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

// Création du dossier si inexistant
const ensureDirectoryExistence = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.log('Création du dossier:', filePath);
        fs.mkdirSync(filePath, { recursive: true });
    }
};

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = getUploadPath(req, file);
        if (uploadPath) {
            ensureDirectoryExistence(uploadPath);
            cb(null, uploadPath);
        } else {
            cb(new Error('Format de fichier non supporté'), false);
        }
    },
    filename: (req, file, cb) => {
        const finalName = `${Date.now()}-${file.originalname}`;
        console.log('Nom du fichier sauvegardé:', finalName);
        cb(null, finalName);
    }
});

// Filtrage des types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log('Type de fichier rejeté:', file.mimetype);
        cb(new Error('Format de fichier non supporté'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
