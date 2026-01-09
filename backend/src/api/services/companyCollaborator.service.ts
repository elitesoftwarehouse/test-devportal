import { PrismaClient, CompanyCollaboratorStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors/httpErrors';
import { CompanyCollaboratorMapper } from '../mappers/companyCollaborator.mapper';

const prisma = new PrismaClient();

export interface ListCompanyCollaboratorsParams {
  companyId: string;
  status?: 'ATTIVO' | 'INATTIVO';
  page: number;
  size: number;
}

export interface CreateCompanyCollaboratorParams {
  companyId: string;
  userId: string;
  role: string;
  notes?: string;
}

export interface UpdateCompanyCollaboratorParams {
  id: string;
  companyId: string;
  role?: string;
  notes?: string;
}

export interface UpdateCompanyCollaboratorStatusParams {
  id: string;
  companyId: string;
  status: 'ATTIVO' | 'INATTIVO';
}

export class CompanyCollaboratorService {
  async listByCompany(params: ListCompanyCollaboratorsParams) {
    const { companyId, status, page, size } = params;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Azienda non trovata');
    }

    const where: any = { companyId };
    if (status) {
      where.status = status as CompanyCollaboratorStatus;
    }

    const [items, total] = await Promise.all([
      prisma.companyCollaborator.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      prisma.companyCollaborator.count({ where }),
    ]);

    return {
      content: items.map(CompanyCollaboratorMapper.toDto),
      page,
      size,
      total,
    };
  }

  async createAssociation(params: CreateCompanyCollaboratorParams) {
    const { companyId, userId, role, notes } = params;

    if (!companyId || !userId || !role) {
      throw new BadRequestError('companyId, userId e role sono obbligatori');
    }

    const [company, user] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!company) {
      throw new NotFoundError('Azienda non trovata');
    }

    if (!user) {
      throw new NotFoundError('Utente collaboratore non trovato');
    }

    const existing = await prisma.companyCollaborator.findFirst({
      where: {
        companyId,
        userId,
      },
    });

    if (existing) {
      throw new ConflictError('Il collaboratore è già associato a questa azienda');
    }

    const created = await prisma.companyCollaborator.create({
      data: {
        companyId,
        userId,
        role,
        notes: notes || null,
        status: 'ATTIVO',
      },
      include: { user: true },
    });

    return CompanyCollaboratorMapper.toDto(created);
  }

  async updateAssociation(params: UpdateCompanyCollaboratorParams) {
    const { id, companyId, role, notes } = params;

    const association = await prisma.companyCollaborator.findFirst({
      where: {
        id,
        companyId,
      },
      include: { user: true },
    });

    if (!association) {
      throw new NotFoundError('Associazione collaboratore-azienda non trovata');
    }

    if (!role && typeof notes === 'undefined') {
      throw new BadRequestError('Nessun campo da aggiornare');
    }

    const updated = await prisma.companyCollaborator.update({
      where: { id: association.id },
      data: {
        role: typeof role !== 'undefined' ? role : association.role,
        notes: typeof notes !== 'undefined' ? notes : association.notes,
      },
      include: { user: true },
    });

    return CompanyCollaboratorMapper.toDto(updated);
  }

  async updateStatus(params: UpdateCompanyCollaboratorStatusParams) {
    const { id, companyId, status } = params;

    if (!['ATTIVO', 'INATTIVO'].includes(status)) {
      throw new BadRequestError('Stato non valido');
    }

    const association = await prisma.companyCollaborator.findFirst({
      where: {
        id,
        companyId,
      },
      include: { user: true },
    });

    if (!association) {
      throw new NotFoundError('Associazione collaboratore-azienda non trovata');
    }

    if (association.status === status) {
      return CompanyCollaboratorMapper.toDto(association);
    }

    const updated = await prisma.companyCollaborator.update({
      where: { id: association.id },
      data: {
        status: status as CompanyCollaboratorStatus,
      },
      include: { user: true },
    });

    return CompanyCollaboratorMapper.toDto(updated);
  }
}
