import { CompanyCollaborator, User } from '@prisma/client';
import { CompanyCollaboratorDto } from '../dto/companyCollaborator.dto';

export class CompanyCollaboratorMapper {
  static toDto(entity: CompanyCollaborator & { user: User }): CompanyCollaboratorDto {
    return {
      id: entity.id,
      companyId: entity.companyId,
      userId: entity.userId,
      role: entity.role,
      status: entity.status as 'ATTIVO' | 'INATTIVO',
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      user: {
        id: entity.user.id,
        firstName: entity.user.firstName,
        lastName: entity.user.lastName,
        email: entity.user.email,
      },
    };
  }
}
