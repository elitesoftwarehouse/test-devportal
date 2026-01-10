const { DataTypes } = require('sequelize');

/**
 * Modello Azienda fornitrice
 * Nota: questo file è incluso per rendere i test eseguibili in modo autonomo.
 * In un progetto reale, il modello potrebbe già esistere in una posizione leggermente diversa.
 */

function defineFornitoreAzienda(sequelize) {
  const FornitoreAzienda = sequelize.define(
    'FornitoreAzienda',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      ragioneSociale: {
        type: DataTypes.STRING,
        allowNull: false
      },
      partitaIva: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [11, 16]
        }
      },
      codiceFiscale: {
        type: DataTypes.STRING(16),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Formato email non valido'
          }
        }
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: true
      },
      indirizzo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      attivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'fornitori_aziende',
      timestamps: true
    }
  );

  return FornitoreAzienda;
}

module.exports = {
  defineFornitoreAzienda
};
