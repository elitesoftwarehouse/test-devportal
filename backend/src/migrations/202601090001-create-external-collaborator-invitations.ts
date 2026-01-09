import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateExternalCollaboratorInvitations202601090001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'external_collaborator_invitations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'expiresAt',
            type: 'timestamp with time zone',
            isNullable: false
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: `'PENDING'`
          },
          {
            name: 'ownerId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'companyId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'acceptedById',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'acceptedAt',
            type: 'timestamp with time zone',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'now()'
          }
        ]
      })
    );

    await queryRunner.createIndex(
      'external_collaborator_invitations',
      new TableIndex({ name: 'IDX_external_collab_invitation_email', columnNames: ['email'] })
    );

    await queryRunner.createIndex(
      'external_collaborator_invitations',
      new TableIndex({ name: 'IDX_external_collab_invitation_token', columnNames: ['token'], isUnique: true })
    );

    await queryRunner.createForeignKey(
      'external_collaborator_invitations',
      new TableForeignKey({
        columnNames: ['ownerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'external_collaborator_invitations',
      new TableForeignKey({
        columnNames: ['companyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'external_collaborator_invitations',
      new TableForeignKey({
        columnNames: ['acceptedById'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('external_collaborator_invitations');
  }
}
