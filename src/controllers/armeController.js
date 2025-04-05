const { CategorieTaille } = require('../db/sequelize');

async function creerCategorieTaille(req, res) {
    try {
        const { nom } = req.body;
        const nouvelleCategorie = await CategorieTaille.create({ nom });
        res.status(201).json(nouvelleCategorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function obtenirToutesLesCategories(req, res) {
    try {
        const categories = await CategorieTaille.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function mettreAJourCategorieTaille(req, res) {
    try {
        const { id } = req.params;
        const { nom } = req.body;

        const categorie = await CategorieTaille.findByPk(id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie de taille non trouvée" });
        }

        // Mettre à jour la catégorie
        await categorie.update({ nom });

        res.status(200).json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function obtenirCategorieTailleParId(req, res) {
    try {
        const { id } = req.params;
        const categorie = await CategorieTaille.findByPk(id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie de taille non trouvée" });
        }

        res.status(200).json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function supprimerCategorieTaille(req, res) {
    try {
        const { id } = req.params;
        const categorie = await CategorieTaille.findByPk(id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie de taille non trouvée" });
        }

        await categorie.destroy();
        res.status(204).json({ message: "Catégorie de taille supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    creerCategorieTaille,
    obtenirToutesLesCategories,
    mettreAJourCategorieTaille, 
    obtenirCategorieTailleParId, 
    supprimerCategorieTaille 
};

