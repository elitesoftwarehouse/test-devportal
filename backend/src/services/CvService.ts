import { Cv } from '@prisma/client';
import { CvRepository, CreateCvData } from '../repositories/CvRepository';

export interface FileStorage {
  save: (buffer: Buffer, destinationPath: string) => Promise<void>;
}

export class CvService {
  private repository: CvRepository;
  private storage: FileStorage;

  constructor(repository: CvRepository, storage: FileStorage) {
    this.repository = repository;
    this.storage = storage;
  }

  async uploadNewCv(collaboratorId: number, file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<Cv> {
    if (!file || !file.buffer || !file.originalname) {
      throw new Error('FILE_INVALID');
    }

    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const destinationPath = `cv/${collaboratorId}/${Date.now()}_${sanitizedName}`;

    await this.storage.save(file.buffer, destinationPath);

    await this.repository.unsetCurrentForCollaborator(collaboratorId);

    const data: CreateCvData = {
      collaboratorId,
      fileName: sanitizedName,
      filePath: destinationPath,
      mimeType: file.mimetype
    };

    return this.repository.createCv(data);
  }

  async deleteCv(collaboratorId: number, cvId: number): Promise<Cv | null> {
    const cv = await this.repository.getById(cvId, collaboratorId);
    if (!cv) {
      return null;
    }
    return this.repository.logicalDelete(cvId, collaboratorId);
  }

  async listActiveCvs(collaboratorId: number): Promise<Cv[]> {
    return this.repository.listByCollaborator(collaboratorId, { onlyNotDeleted: true });
  }

  async listAllHistory(collaboratorId: number): Promise<Cv[]> {
    return this.repository.listByCollaborator(collaboratorId);
  }

  async getCurrentCv(collaboratorId: number): Promise<Cv | null> {
    const list = await this.repository.listByCollaborator(collaboratorId, { onlyNotDeleted: true, onlyCurrent: true });
    if (list.length === 0) {
      return null;
    }
    return list[0];
  }
}
