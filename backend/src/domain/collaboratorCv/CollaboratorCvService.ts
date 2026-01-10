import { CollaboratorCvRepository } from './CollaboratorCvRepository';
import {
  CollaboratorCvEntity,
  CollaboratorCvFilter,
  CreateCollaboratorCvDTO,
  MarkCvCorrenteDTO,
  SoftDeleteCvDTO,
} from './CollaboratorCvEntity';

export class CollaboratorCvService {
  private readonly repository: CollaboratorCvRepository;

  constructor(repository: CollaboratorCvRepository) {
    this.repository = repository;
  }

  async uploadCv(dto: CreateCollaboratorCvDTO): Promise<CollaboratorCvEntity> {
    if (!dto.collaboratorId) {
      throw new Error('collaboratorId obbligatorio');
    }

    if (!dto.fileName || !dto.filePath || !dto.contentType) {
      throw new Error('Dati file CV incompleti');
    }

    const created = await this.repository.create(dto);

    if (dto.flagIsCorrente) {
      await this.repository.markAsCorrente({
        collaboratorId: dto.collaboratorId,
        cvId: created.id,
        updatedByUserId: dto.createdByUserId,
      });
      const refreshed = await this.repository.getById(created.id);
      if (refreshed) return refreshed;
    }

    return created;
  }

  async setCvAsCorrente(dto: MarkCvCorrenteDTO): Promise<void> {
    await this.repository.markAsCorrente(dto);
  }

  async softDeleteCv(dto: SoftDeleteCvDTO): Promise<void> {
    await this.repository.softDelete(dto);
  }

  async listByCollaborator(filter: CollaboratorCvFilter): Promise<CollaboratorCvEntity[]> {
    return this.repository.listByFilter(filter);
  }
}
