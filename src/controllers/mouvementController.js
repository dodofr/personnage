const { Cadran, Vaisseau } = require('../db/sequelize');
const fs = require('fs');
const path = require('path');

async function creerCadran(req, res) {
    try {
        const { nom, vaisseauCadran } = req.body;
        const imagePath = req.file ? `uploads/images/cadran/${req.file.filename}` : null;

        const nouveauCadran = await Cadran.create({ nom, vaisseauCadran, image: imagePath });

        res.status(201).json(nouveauCadran);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function obtenirTousLesCadrans(req, res) {
    try {
        const cadrans = await Cadran.findAll({
            include: [{ model: Vaisseau, attributes: ['nom'] }]
        });
        res.status(200).json(cadrans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function obtenirCadranParId(req, res) {
    try {
        const { id } = req.params;
        const cadran = await Cadran.findByPk(id, {
            include: [{ model: Vaisseau, attributes: ['nom'] }]
        });

        if (!cadran) {
            return res.status(404).json({ message: "Cadran non trouvé" });
        }

        res.status(200).json(cadran);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function mettreAJourCadran(req, res) {
    try {
        const { id } = req.params;
        const { nom, vaisseauCadran } = req.body;
        const cadran = await Cadran.findByPk(id);

        if (!cadran) {
            return res.status(404).json({ message: "Cadran non trouvé" });
        }

        // Suppression de l'ancienne image si une nouvelle est uploadée
        if (req.file && cadran.image) {
            const oldImagePath = path.join(__dirname, '..', cadran.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        const imagePath = req.file ? `uploads/images/cadran/${req.file.filename}` : cadran.image;

        await cadran.update({ nom, vaisseauCadran, image: imagePath });

        res.status(200).json(cadran);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function supprimerCadran(req, res) {
    try {
        const { id } = req.params;
        const cadran = await Cadran.findByPk(id);

        if (!cadran) {
            return res.status(404).json({ message: "Cadran non trouvé" });
        }

        if (cadran.image) {
            const imagePath = path.join(__dirname, '..', cadran.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await cadran.destroy();
        res.status(204).json({ message: "Cadran supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    creerCadran,
    obtenirTousLesCadrans,
    obtenirCadranParId,
    mettreAJourCadran,
    supprimerCadran
};
