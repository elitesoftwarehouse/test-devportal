const { DataTypes } = require('sequelize');

/**
 * Modello di associazione tra Company e User/Collaborator.
 * Rappresenta un collaboratore associato ad una specifica azienda
 * con ruolo e stato.
 */
module.exports = (sequelize) => {
  const CompanyCollaborator = sequelize.define(
    'CompanyCollaborator',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        field: 'company_id',
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      userId: {
        field: 'user_id',
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      role: {
        // Semplice stringa validata a livello applicativo per mantenere flessibilità.
        // Esempi: 'ADMIN', 'REFERENTE', 'COLLABORATORE'.
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        // Enum applicativo a due stati: ATTIVO / INATTIVO
        type: DataTypes.ENUM('ATTIVO', 'INATTIVO'),
        allowNull: false,
        defaultValue: 'ATTIVO',
      },
      createdBy: {
        field: 'created_by',
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      updatedBy: {
        field: 'updated_by',
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'company_collaborators',
      underscored: true,
      indexes: [
        {
          name: 'idx_company_collaborators_company_id',
          fields: ['company_id'],
        },
        {
          name: 'idx_company_collaborators_user_id',
          fields: ['user_id'],
        },
        {
          // vincolo logico: un collaboratore non può essere duplicato per la stessa azienda con lo stesso ruolo
          name: 'uniq_company_collaborator_role',
          unique: true,
          fields: ['company_id', 'user_id', 'role'],
        },
      ],
    }
  );

  CompanyCollaborator.associate = (models) => {
    CompanyCollaborator.belongsTo(models.Company, {
      as: 'company',
      foreignKey: 'companyId',
    });

    CompanyCollaborator.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
    });
  };

  return CompanyCollaborator;
};
