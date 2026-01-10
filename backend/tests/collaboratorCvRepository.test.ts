import knex, { Knex } from 'knex';
import { CollaboratorCvRepository } from '../src/domain/collaboratorCv/CollaboratorCvRepository';
import { CollaboratorCvService } from '../src/domain/collaboratorCv/CollaboratorCvService';

let db: Knex;

beforeAll(async () => {
  db = knex({
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
  });

  await db.schema.createTable('CollaboratorCVs', (table) => {
    table.string('id').primary();
    table.string('collaboratorId').notNullable();
    table.string('fileName').notNullable();
    table.string('filePath').notNullable();
    table.string('contentType').notNullable();
    table.integer('fileSize').notNullable();
    table.boolean('flagIsCorrente').notNullable().defaultTo(false);
    table.boolean('flagIsDeleted').notNullable().defaultTo(false);
    table.string('versionLabel');
    table.text('note');
    table.string('createdByUserId').notNullable();
    table.dateTime('createdAt').notNullable();
    table.string('updatedByUserId');
    table.dateTime('updatedAt');
    table.string('deletedByUserId');
    table.dateTime('deletedAt');
  });
});

afterAll(async () => {
  await db.destroy();
});

describe('CollaboratorCvRepository e Service', () => {
  it('crea un CV e lo imposta come corrente', async () => {
    const repo = new CollaboratorCvRepository(db);
    const service = new CollaboratorCvService(repo);

    const collaboratorId = 'collab-1';

    const created = await service.uploadCv({
      collaboratorId,
      fileName: 'cv1.pdf',
      filePath: '/tmp/cv1.pdf',
      contentType: 'application/pdf',
      fileSize: 1234,
      createdByUserId: 'user-1',
      flagIsCorrente: true,
    });

    expect(created).toBeDefined();

    const list = await service.listByCollaborator({ collaboratorId });
    expect(list.length).toBe(1);
    expect(list[0].flagIsCorrente).toBe(true);
  });

  it('soft delete di un CV', async () => {
    const repo = new CollaboratorCvRepository(db);
    const service = new CollaboratorCvService(repo);

    const collaboratorId = 'collab-2';

    const created = await service.uploadCv({
      collaboratorId,
      fileName: 'cv2.pdf',
      filePath: '/tmp/cv2.pdf',
      contentType: 'application/pdf',
      fileSize: 4567,
      createdByUserId: 'user-1',
    });

    await service.softDeleteCv({ cvId: created.id, deletedByUserId: 'user-2' });

    const list = await service.listByCollaborator({ collaboratorId });
    expect(list.length).toBe(0);

    const listAll = await service.listByCollaborator({ collaboratorId, includeDeleted: true });
    expect(listAll.length).toBe(1);
    expect(listAll[0].flagIsDeleted).toBe(true);
  });

  it('marcatura di un CV come corrente mette a storico gli altri', async () => {
    const repo = new CollaboratorCvRepository(db);
    const service = new CollaboratorCvService(repo);

    const collaboratorId = 'collab-3';

    const cv1 = await service.uploadCv({
      collaboratorId,
      fileName: 'cv3-1.pdf',
      filePath: '/tmp/cv3-1.pdf',
      contentType: 'application/pdf',
      fileSize: 1000,
      createdByUserId: 'user-1',
      flagIsCorrente: true,
    });

    const cv2 = await service.uploadCv({
      collaboratorId,
      fileName: 'cv3-2.pdf',
      filePath: '/tmp/cv3-2.pdf',
      contentType: 'application/pdf',
      fileSize: 2000,
      createdByUserId: 'user-1',
    });

    await service.setCvAsCorrente({ collaboratorId, cvId: cv2.id, updatedByUserId: 'user-1' });

    const list = await service.listByCollaborator({ collaboratorId });

    const current = list.find((c) => c.flagIsCorrente);
    expect(current).toBeDefined();
    expect(current!.id).toBe(cv2.id);

    const old = list.find((c) => c.id === cv1.id);
    expect(old!.flagIsCorrente).toBe(false);
  });
});
