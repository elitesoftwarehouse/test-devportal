import { PrismaClient, Cv } from '@prisma/client';

export interface CreateCvData {
  collaboratorId: number;
  fileName: string;
  filePath: string;
  mimeType: string;
}

export class CvRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async createCv(data: CreateCvData): Promise<Cv> {
    return this.prisma.cv.create({
      data: {
        collaboratorId: data.collaboratorId,
        fileName: data.fileName,
        filePath: data.filePath,
        mimeType: data.mimeType,
        isCurrent: true,
        isDeleted: false
      }
    });
  }

  async unsetCurrentForCollaborator(collaboratorId: number): Promise<void> {
    await this.prisma.cv.updateMany({
      where: { collaboratorId, isCurrent: true },
      data: { isCurrent: false }
    });
  }

  async setCurrent(cvId: number, collaboratorId: number): Promise<Cv | null> {
    const cv = await this.prisma.cv.findFirst({ where: { id: cvId, collaboratorId, isDeleted: false } });
    if (!cv) {
      return null;
    }
    await this.unsetCurrentForCollaborator(collaboratorId);
    return this.prisma.cv.update({ where: { id: cvId }, data: { isCurrent: true } });
  }

  async logicalDelete(cvId: number, collaboratorId: number): Promise<Cv | null> {
    const cv = await this.prisma.cv.findFirst({ where: { id: cvId, collaboratorId } });
    if (!cv) {
      return null;
    }
    return this.prisma.cv.update({ where: { id: cvId }, data: { isDeleted: true, isCurrent: false } });
  }

  async getById(cvId: number, collaboratorId: number): Promise<Cv | null> {
    return this.prisma.cv.findFirst({ where: { id: cvId, collaboratorId } });
  }

  async listByCollaborator(collaboratorId: number, options?: { onlyNotDeleted?: boolean; onlyCurrent?: boolean }): Promise<Cv[]> {
    const where: any = { collaboratorId };
    if (options?.onlyNotDeleted) {
      where.isDeleted = false;
    }
    if (options?.onlyCurrent) {
      where.isCurrent = true;
    }
    return this.prisma.cv.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}
