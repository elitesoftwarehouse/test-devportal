const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const UserModel = require('./User');

const models = {};

models.User = UserModel(sequelize);

function getModels() {
  return models;
}

module.exports = {
  sequelize,
  getModels,
};
