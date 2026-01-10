import { CvService, FileStorage } from '../../src/services/CvService';
import { CvRepository } from '../../src/repositories/CvRepository';

class InMemoryCvRepository extends CvRepository {
  private data: any[] = [];
  private idSeq = 1;

  constructor() {
    // @ts-ignore
    super({});
  }

  async createCv(data: any): Promise<any> {
    const cv = {
      id: this.idSeq++,
      collaboratorId: data.collaboratorId,
      fileName: data.fileName,
      filePath: data.filePath,
      mimeType: data.mimeType,
      isCurrent: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(cv);
    return cv;
  }

  async unsetCurrentForCollaborator(collaboratorId: number): Promise<void> {
    this.data = this.data.map((cv) =>
      cv.collaboratorId === collaboratorId && cv.isCurrent ? { ...cv, isCurrent: false } : cv
    );
  }

  async logicalDelete(cvId: number, collaboratorId: number): Promise<any | null> {
    const index = this.data.findIndex((cv) => cv.id === cvId && cv.collaboratorId === collaboratorId);
    if (index === -1) return null;
    this.data[index] = { ...this.data[index], isDeleted: true, isCurrent: false };
    return this.data[index];
  }

  async getById(cvId: number, collaboratorId: number): Promise<any | null> {
    return this.data.find((cv) => cv.id === cvId && cv.collaboratorId === collaboratorId) || null;
  }

  async listByCollaborator(collaboratorId: number, options?: any): Promise<any[]> {
    let result = this.data.filter((cv) => cv.collaboratorId === collaboratorId);
    if (options?.onlyNotDeleted) {
      result = result.filter((cv) => !cv.isDeleted);
    }
    if (options?.onlyCurrent) {
      result = result.filter((cv) => cv.isCurrent);
    }
    return result;
  }
}

class MockStorage implements FileStorage {
  public saved: { buffer: Buffer; path: string }[] = [];
  async save(buffer: Buffer, destinationPath: string): Promise<void> {
    this.saved.push({ buffer, path: destinationPath });
  }
}

describe('CvService', () => {
  let repository: InMemoryCvRepository;
  let storage: MockStorage;
  let service: CvService;

  beforeEach(() => {
    repository = new InMemoryCvRepository();
    storage = new MockStorage();
    service = new CvService(repository as unknown as CvRepository, storage);
  });

  it('uploadNewCv rende non-corrente il precedente mantenendo lo storico', async () => {
    const buffer = Buffer.from('dummy');

    const first = await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv1.pdf',
      mimetype: 'application/pdf'
    });

    const second = await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv2.pdf',
      mimetype: 'application/pdf'
    });

    const all = await repository.listByCollaborator(1);

    expect(all.length).toBe(2);
    const current = all.filter((cv) => cv.isCurrent);
    expect(current.length).toBe(1);
    expect(current[0].id).toBe(second.id);
    const previous = all.find((cv) => cv.id === first.id);
    expect(previous!.isCurrent).toBe(false);
    expect(previous!.isDeleted).toBe(false);
  });

  it('uploadNewCv lancia errore FILE_INVALID per file non valido', async () => {
    // @ts-ignore
    await expect(service.uploadNewCv(1, null)).rejects.toThrow('FILE_INVALID');
  });

  it('deleteCv effettua eliminazione logica sia per CV corrente che non corrente', async () => {
    const buffer = Buffer.from('dummy');

    const current = await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv1.pdf',
      mimetype: 'application/pdf'
    });

    const deletedCurrent = await service.deleteCv(1, current.id);
    expect(deletedCurrent).not.toBeNull();
    expect(deletedCurrent!.isDeleted).toBe(true);
    expect(deletedCurrent!.isCurrent).toBe(false);

    const nonCurrent = await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv2.pdf',
      mimetype: 'application/pdf'
    });

    await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv3.pdf',
      mimetype: 'application/pdf'
    });

    const deletedNonCurrent = await service.deleteCv(1, nonCurrent.id);
    expect(deletedNonCurrent).not.toBeNull();
    expect(deletedNonCurrent!.isDeleted).toBe(true);
  });

  it('deleteCv ritorna null quando non esiste alcun CV', async () => {
    const result = await service.deleteCv(1, 999);
    expect(result).toBeNull();
  });

  it('getCurrentCv ritorna null quando non esiste alcun CV', async () => {
    const current = await service.getCurrentCv(1);
    expect(current).toBeNull();
  });

  it('listActiveCvs ritorna solo CV non eliminati', async () => {
    const buffer = Buffer.from('dummy');
    const cv1 = await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv1.pdf',
      mimetype: 'application/pdf'
    });
    await service.uploadNewCv(1, {
      buffer,
      originalname: 'cv2.pdf',
      mimetype: 'application/pdf'
    });
    await service.deleteCv(1, cv1.id);

    const active = await service.listActiveCvs(1);
    expect(active.every((cv) => cv.isDeleted === false)).toBe(true);
  });
});
