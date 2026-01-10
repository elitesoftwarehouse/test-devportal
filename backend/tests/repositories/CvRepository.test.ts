import { CvRepository } from '../../src/repositories/CvRepository';

class PrismaCvMock {
  public cv: any;

  private data: any[] = [];

  constructor() {
    this.cv = {
      create: jest.fn(this.create.bind(this)),
      findFirst: jest.fn(this.findFirst.bind(this)),
      findMany: jest.fn(this.findMany.bind(this)),
      update: jest.fn(this.update.bind(this)),
      updateMany: jest.fn(this.updateMany.bind(this))
    };
  }

  async create({ data }: any) {
    const id = this.data.length + 1;
    const record = {
      id,
      ...data,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date()
    };
    this.data.push(record);
    return record;
  }

  async findFirst({ where }: any) {
    return (
      this.data.find((item) => {
        return Object.keys(where).every((key) => item[key] === where[key]);
      }) || null
    );
  }

  async findMany({ where, orderBy }: any) {
    let result = this.data.filter((item) => {
      if (!where) return true;
      return Object.keys(where).every((key) => item[key] === where[key]);
    });
    if (orderBy && orderBy.createdAt) {
      result = result.sort((a, b) => {
        return orderBy.createdAt === 'desc'
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime();
      });
    }
    return result;
  }

  async update({ where, data }: any) {
    const index = this.data.findIndex((item) => item.id === where.id);
    if (index === -1) {
      throw new Error('Record not found');
    }
    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  async updateMany({ where, data }: any) {
    this.data = this.data.map((item) => {
      const match = Object.keys(where).every((key) => item[key] === where[key]);
      if (match) {
        return { ...item, ...data };
      }
      return item;
    });
    return { count: this.data.length };
  }
}

describe('CvRepository', () => {
  let prismaMock: any;
  let repository: CvRepository;

  beforeEach(() => {
    prismaMock = new PrismaCvMock();
    repository = new CvRepository(prismaMock as any);
  });

  it('crea un nuovo CV con flag corrente e non eliminato', async () => {
    const cv = await repository.createCv({
      collaboratorId: 1,
      fileName: 'cv.pdf',
      filePath: 'cv/1/cv.pdf',
      mimeType: 'application/pdf'
    });
    expect(cv.id).toBe(1);
    expect(cv.isCurrent).toBe(true);
    expect(cv.isDeleted).toBe(false);
  });

  it('imposta tutti i CV correnti di un collaboratore come non correnti', async () => {
    await repository.createCv({ collaboratorId: 1, fileName: 'a.pdf', filePath: 'a', mimeType: 'application/pdf' });
    await repository.createCv({ collaboratorId: 1, fileName: 'b.pdf', filePath: 'b', mimeType: 'application/pdf' });

    await repository.unsetCurrentForCollaborator(1);

    const list = await repository.listByCollaborator(1);
    expect(list.every((cv) => cv.isCurrent === false)).toBe(true);
  });

  it('setCurrent rende corrente solo il CV richiesto', async () => {
    const cv1 = await repository.createCv({ collaboratorId: 1, fileName: 'a.pdf', filePath: 'a', mimeType: 'application/pdf' });
    const cv2 = await repository.createCv({ collaboratorId: 1, fileName: 'b.pdf', filePath: 'b', mimeType: 'application/pdf' });

    const updated = await repository.setCurrent(cv1.id, 1);

    expect(updated).not.toBeNull();
    const list = await repository.listByCollaborator(1);
    const current = list.filter((x) => x.isCurrent);
    expect(current.length).toBe(1);
    expect(current[0].id).toBe(cv1.id);
    expect(list.find((x) => x.id === cv2.id)?.isCurrent).toBe(false);
  });

  it('logicalDelete imposta isDeleted e rimuove il flag corrente', async () => {
    const cv = await repository.createCv({ collaboratorId: 1, fileName: 'a.pdf', filePath: 'a', mimeType: 'application/pdf' });

    const deleted = await repository.logicalDelete(cv.id, 1);

    expect(deleted).not.toBeNull();
    expect(deleted!.isDeleted).toBe(true);
    expect(deleted!.isCurrent).toBe(false);
  });

  it('listByCollaborator filtra solo non eliminati', async () => {
    const cv1 = await repository.createCv({ collaboratorId: 1, fileName: 'a.pdf', filePath: 'a', mimeType: 'application/pdf' });
    const cv2 = await repository.createCv({ collaboratorId: 1, fileName: 'b.pdf', filePath: 'b', mimeType: 'application/pdf' });
    await repository.logicalDelete(cv2.id, 1);

    const active = await repository.listByCollaborator(1, { onlyNotDeleted: true });
    expect(active.length).toBe(1);
    expect(active[0].id).toBe(cv1.id);
  });

  it('listByCollaborator filtra solo correnti', async () => {
    const cv1 = await repository.createCv({ collaboratorId: 1, fileName: 'a.pdf', filePath: 'a', mimeType: 'application/pdf' });
    const cv2 = await repository.createCv({ collaboratorId: 1, fileName: 'b.pdf', filePath: 'b', mimeType: 'application/pdf' });

    await repository.setCurrent(cv1.id, 1);

    const current = await repository.listByCollaborator(1, { onlyCurrent: true });
    expect(current.length).toBe(1);
    expect(current[0].id).toBe(cv1.id);
  });
});
