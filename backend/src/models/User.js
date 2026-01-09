const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

/**
 * Modello User
 * Aggiornato per supportare registrazione utenti esterni con attivazione.
 */

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          'ADMIN',
          'INTERNAL_USER',
          'EXTERNAL_OWNER',
          'EXTERNAL_COLLABORATOR'
        ),
        allowNull: false,
        defaultValue: 'INTERNAL_USER',
      },
      status: {
        // PENDING_ACTIVATION, ACTIVE, DISABLED
        type: DataTypes.ENUM('PENDING_ACTIVATION', 'ACTIVE', 'DISABLED'),
        allowNull: false,
        defaultValue: 'PENDING_ACTIVATION',
      },
      activationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      activationTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          if (user.changed('passwordHash')) {
            const saltRounds = 10;
            user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('passwordHash')) {
            const saltRounds = 10;
            user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
          }
        },
      },
    }
  );

  User.prototype.checkPassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  return User;
};
