const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Définition des dossiers en fonction du type d'entité
const getUploadPath = (req, file) => {
    if (file.mimetype.startsWith('image/')) {
        if (req.baseUrl.includes('personnage')) return 'uploads/images/personnage/';
        if (req.baseUrl.includes('equipement')) return 'uploads/images/equipement/';
        if (req.baseUrl.includes('faction')) return 'uploads/images/faction/';
        if (req.baseUrl.includes('groupe')) return 'uploads/images/groupe/';
        if (req.baseUrl.includes('planete')) return 'uploads/images/planete/';
        if (req.baseUrl.includes('pouvoir')) return 'uploads/images/pouvoir/';
        if (req.baseUrl.includes('vehicule')) return 'uploads/images/vehicule/';
        return 'uploads/images/autres/';
    } else if (file.mimetype === 'application/pdf') {
        return 'uploads/documents/';
    }
    return null;
};

// Création du dossier si inexistant
const ensureDirectoryExistence = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
};

// Configuration du stockage des fichiers
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
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
