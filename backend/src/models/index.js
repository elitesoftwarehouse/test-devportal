const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Caricamento dinamico di tutti i modelli nella directory
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.js' || file.slice(-3) === '.ts')
    );
  })
  .forEach((file) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Esegue le associazioni definite nei modelli
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Associazioni già esistenti per Company e User mantenute qui.
// Nuove associazioni specifiche per CompanyCollaborator sono definite nel relativo model.

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Helper function per retrocompatibilità
function getModels() {
  return db;
}

module.exports = db;
module.exports.getModels = getModels;
