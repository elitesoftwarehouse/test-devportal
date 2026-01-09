/* eslint-disable @typescript-eslint/no-var-requires */
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      if (models.Company) {
        User.hasMany(models.Company, {
          as: 'ownedCompanies',
          foreignKey: 'ownerUserId',
        });
      }
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'last_name',
      },
      // altri campi utente esistenti...
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  );

  return User;
};
