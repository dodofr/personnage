// // src/utils/verifyOrCreate.js

// /**
//  * Vérifie si une entité avec un nom donné existe, sinon la crée.
//  * @param {Model} Model - Le modèle Sequelize (ex: Planete, Faction...)
//  * @param {string} nom - Le nom de l'entité à rechercher ou créer
//  * @returns {Promise<Model|null>} - L'instance trouvée ou créée, ou null si nom invalide
//  */
// const verifyOrCreate = async (Model, nom) => {
//     if (!nom || typeof nom !== 'string' || nom.trim() === '') {
//       return null;
//     }
  
//     const [entity] = await Model.findOrCreate({
//       where: { nom: nom.trim() },
//     });
  
//     return entity;
//   };
  
//   module.exports = { verifyOrCreate };
 /**
 * Vérifie si une entité existe par nom, sinon la crée avec nom et descriptif
 * @param {Model} Model - Le modèle Sequelize (ex: Planete, Faction...)
 * @param {Object|string} data - soit un string (nom), soit { nom, descriptif }
 * @returns {Promise<Model|null>}
 */
const verifyOrCreate = async (Model, data) => {
  if (!data) return null;

  let nom = '', description = '';
  if (typeof data === 'string') {
    nom = data.trim();
  } else if (typeof data === 'object') {
    nom = data.nom?.trim() || '';
    description = data.descriptif || '';
  }

  if (!nom) return null;

  const [entity] = await Model.findOrCreate({
    where: { nom },
    defaults: { description }
  });

  return entity;
};


module.exports = { verifyOrCreate };
 