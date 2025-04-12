// src/utils/verifyOrCreate.js

/**
 * Vérifie si une entité avec un nom donné existe, sinon la crée.
 * @param {Model} Model - Le modèle Sequelize (ex: Planete, Faction...)
 * @param {string} nom - Le nom de l'entité à rechercher ou créer
 * @returns {Promise<Model|null>} - L'instance trouvée ou créée, ou null si nom invalide
 */
const verifyOrCreate = async (Model, nom) => {
    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return null;
    }
  
    const [entity] = await Model.findOrCreate({
      where: { nom: nom.trim() },
    });
  
    return entity;
  };
  
  module.exports = { verifyOrCreate };
  