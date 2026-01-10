import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  CollaboratorCvEntity,
  CreateCollaboratorCvDTO,
  CollaboratorCvFilter,
  MarkCvCorrenteDTO,
  SoftDeleteCvDTO,
} from './CollaboratorCvEntity';

const TABLE_NAME = 'CollaboratorCVs';

export class CollaboratorCvRepository {
  private readonly db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async create(dto: CreateCollaboratorCvDTO): Promise<CollaboratorCvEntity> {
    const id = uuidv4();
    const now = new Date();

    const record: Partial<CollaboratorCvEntity> = {
      id,
      collaboratorId: dto.collaboratorId,
      fileName: dto.fileName,
      filePath: dto.filePath,
      contentType: dto.contentType,
      fileSize: dto.fileSize,
      flagIsCorrente: dto.flagIsCorrente ?? false,
      flagIsDeleted: false,
      versionLabel: dto.versionLabel ?? null,
      note: dto.note ?? null,
      createdByUserId: dto.createdByUserId,
      createdAt: now,
      updatedByUserId: null,
      updatedAt: null,
      deletedByUserId: null,
      deletedAt: null,
    };

    await this.db<CollaboratorCvEntity>(TABLE_NAME).insert(record);

    const created = await this.db<CollaboratorCvEntity>(TABLE_NAME)
      .where({ id })
      .first();

    if (!created) {
      throw new Error('Errore durante la creazione del CV collaboratore');
    }

    return created;
  }

  async markAsCorrente(dto: MarkCvCorrenteDTO): Promise<void> {
    const now = new Date();

    await this.db.transaction(async (trx) => {
      await trx(TABLE_NAME)
        .where({ collaboratorId: dto.collaboratorId, flagIsCorrente: true })
        .update({ flagIsCorrente: false, updatedByUserId: dto.updatedByUserId, updatedAt: now });

      const updatedRows = await trx(TABLE_NAME)
        .where({ id: dto.cvId, collaboratorId: dto.collaboratorId, flagIsDeleted: false })
        .update({ flagIsCorrente: true, updatedByUserId: dto.updatedByUserId, updatedAt: now });

      if (updatedRows === 0) {
        throw new Error('CV non trovato o già eliminato');
      }
    });
  }

  async softDelete(dto: SoftDeleteCvDTO): Promise<void> {
    const now = new Date();

    const updatedRows = await this.db(TABLE_NAME)
      .where({ id: dto.cvId, flagIsDeleted: false })
      .update({
        flagIsDeleted: true,
        flagIsCorrente: false,
        deletedByUserId: dto.deletedByUserId,
        deletedAt: now,
        updatedByUserId: dto.deletedByUserId,
        updatedAt: now,
      });

    if (updatedRows === 0) {
      throw new Error('CV non trovato o già eliminato');
    }
  }

  async listByFilter(filter: CollaboratorCvFilter): Promise<CollaboratorCvEntity[]> {
    const query = this.db<CollaboratorCvEntity>(TABLE_NAME)
      .where('collaboratorId', filter.collaboratorId);

    if (!filter.includeDeleted) {
      query.andWhere('flagIsDeleted', false);
    }

    if (filter.onlyCorrente) {
      query.andWhere('flagIsCorrente', true);
    }

    query.orderBy('createdAt', 'desc');

    return query.select('*');
  }

  async getById(id: string): Promise<CollaboratorCvEntity | undefined> {
    return this.db<CollaboratorCvEntity>(TABLE_NAME).where({ id }).first();
  }
}
