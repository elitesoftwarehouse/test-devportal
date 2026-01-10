import { Knex } from 'knex';

const TABLE_NAME = 'CollaboratorCVs';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (hasTable) return;

  await knex.schema.createTable(TABLE_NAME, (table: Knex.TableBuilder) => {
    table.uuid('id').primary();

    table.uuid('collaboratorId').notNullable().index('IX_CollaboratorCVs_CollaboratorId');

    table.string('fileName', 512).notNullable();
    table.string('filePath', 1024).notNullable();
    table.string('contentType', 256).notNullable();
    table.integer('fileSize').notNullable();

    table.boolean('flagIsCorrente').notNullable().defaultTo(false).index('IX_CollaboratorCVs_IsCorrente');
    table.boolean('flagIsDeleted').notNullable().defaultTo(false).index('IX_CollaboratorCVs_IsDeleted');

    table.string('versionLabel', 128).nullable();
    table.text('note').nullable();

    table.uuid('createdByUserId').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());

    table.uuid('updatedByUserId').nullable();
    table.timestamp('updatedAt').nullable();

    table.uuid('deletedByUserId').nullable();
    table.timestamp('deletedAt').nullable();

    table.index(['collaboratorId', 'flagIsCorrente'], 'IX_CollaboratorCVs_CollaboratorId_IsCorrente');
    table.index(['collaboratorId', 'flagIsDeleted'], 'IX_CollaboratorCVs_CollaboratorId_IsDeleted');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (!hasTable) return;

  await knex.schema.dropTable(TABLE_NAME);
}
