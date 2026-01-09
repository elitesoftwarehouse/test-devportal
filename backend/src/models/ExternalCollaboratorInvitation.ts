import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { Company } from './Company';
import { User } from './User';

export enum ExternalCollaboratorInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED'
}

export interface ExternalCollaboratorInvitationAttributes {
  id: number;
  externalOwnerCompanyId: number; // azienda che invita
  externalOwnerUserId: number | null; // opzionale: utente che effettua l'invito
  invitedEmail: string;
  invitedUserId?: number | null; // utente creato/associato dopo registrazione
  status: ExternalCollaboratorInvitationStatus;
  token: string;
  tokenExpiry: Date;
  registrationCompleted: boolean;
  firstActivationAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExternalCollaboratorInvitationCreationAttributes
  extends Optional<
    ExternalCollaboratorInvitationAttributes,
    'id' | 'externalOwnerUserId' | 'invitedUserId' | 'status' | 'registrationCompleted' | 'firstActivationAt' | 'createdAt' | 'updatedAt'
  > {}

export class ExternalCollaboratorInvitation
  extends Model<ExternalCollaboratorInvitationAttributes, ExternalCollaboratorInvitationCreationAttributes>
  implements ExternalCollaboratorInvitationAttributes
{
  public id!: number;
  public externalOwnerCompanyId!: number;
  public externalOwnerUserId!: number | null;
  public invitedEmail!: string;
  public invitedUserId!: number | null;
  public status!: ExternalCollaboratorInvitationStatus;
  public token!: string;
  public tokenExpiry!: Date;
  public registrationCompleted!: boolean;
  public firstActivationAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExternalCollaboratorInvitation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    externalOwnerCompanyId: {
      field: 'external_owner_company_id',
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Company,
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    externalOwnerUserId: {
      field: 'external_owner_user_id',
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    invitedEmail: {
      field: 'invited_email',
      type: DataTypes.STRING(255),
      allowNull: false
    },
    invitedUserId: {
      field: 'invited_user_id',
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM(
        ExternalCollaboratorInvitationStatus.PENDING,
        ExternalCollaboratorInvitationStatus.ACCEPTED,
        ExternalCollaboratorInvitationStatus.EXPIRED,
        ExternalCollaboratorInvitationStatus.CANCELED
      ),
      allowNull: false,
      defaultValue: ExternalCollaboratorInvitationStatus.PENDING
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    tokenExpiry: {
      field: 'token_expiry',
      type: DataTypes.DATE,
      allowNull: false
    },
    registrationCompleted: {
      field: 'registration_completed',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    firstActivationAt: {
      field: 'first_activation_at',
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'external_collaborator_invitations',
    sequelize,
    indexes: [
      {
        name: 'idx_external_collab_inv_company_email_active',
        unique: true,
        fields: ['external_owner_company_id', 'invited_email'],
        where: {
          status: ExternalCollaboratorInvitationStatus.PENDING
        }
      },
      {
        name: 'idx_external_collab_inv_token',
        unique: true,
        fields: ['token']
      }
    ]
  }
);

Company.hasMany(ExternalCollaboratorInvitation, {
  foreignKey: 'external_owner_company_id',
  as: 'externalCollaboratorInvitations'
});

ExternalCollaboratorInvitation.belongsTo(Company, {
  foreignKey: 'external_owner_company_id',
  as: 'externalOwnerCompany'
});

User.hasMany(ExternalCollaboratorInvitation, {
  foreignKey: 'external_owner_user_id',
  as: 'sentExternalCollaboratorInvitations'
});

ExternalCollaboratorInvitation.belongsTo(User, {
  foreignKey: 'external_owner_user_id',
  as: 'externalOwnerUser'
});

User.hasMany(ExternalCollaboratorInvitation, {
  foreignKey: 'invited_user_id',
  as: 'receivedExternalCollaboratorInvitations'
});

ExternalCollaboratorInvitation.belongsTo(User, {
  foreignKey: 'invited_user_id',
  as: 'invitedUser'
});
