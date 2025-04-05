const jwt = require('jsonwebtoken');
const { User } = require('../db/sequelize');

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Récupérer le token depuis l'en-tête Authorization

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        // Récupérer l'utilisateur à partir de la base de données (si nécessaire)
        const currentUser = await User.findByPk(user.id); // Supposons que le token contient un 'id' utilisateur
        if (!currentUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        req.user = currentUser; // Ajouter l'utilisateur à la requête
        next(); // Passer à la fonction suivante (ici addEbookToBibliotheque)
    });
}

// Middleware pour vérifier le rôle d'admin
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
    next();
}

module.exports = { authenticateToken, authorizeAdmin };
