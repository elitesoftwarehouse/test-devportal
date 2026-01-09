import { Router, Request, Response } from 'express';
import { CompanyCollaboratorService } from '../../domain/companyCollaborator/CompanyCollaboratorService';
import { InMemoryCompanyCollaboratorRepository } from '../../infrastructure/repositories/InMemoryCompanyCollaboratorRepository';
import { requireAdmin } from '../middleware/authMiddleware';
import { CompanyCollaboratorRole } from '../../domain/companyCollaborator/CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from '../../domain/companyCollaborator/CompanyCollaboratorStatus';

const repository = new InMemoryCompanyCollaboratorRepository();
const service = new CompanyCollaboratorService(repository);

export const companyCollaboratorRoutes = Router();

companyCollaboratorRoutes.get('/companies/:companyId/collaborators', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const result = await service.listByCompany(companyId);
    res.json(
      result.map(r => ({
        id: r.id,
        companyId: r.companyId,
        collaboratorId: r.collaboratorId,
        role: r.role,
        status: r.status
      }))
    );
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

companyCollaboratorRoutes.post('/companies/:companyId/collaborators', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { collaboratorId, role } = req.body as { collaboratorId?: string; role?: CompanyCollaboratorRole };
    const created = await service.createAssociation({
      companyId,
      collaboratorId: collaboratorId || '',
      role: role as CompanyCollaboratorRole
    });
    res.status(201).json({
      id: created.id,
      companyId: created.companyId,
      collaboratorId: created.collaboratorId,
      role: created.role,
      status: created.status
    });
  } catch (err: any) {
    if (err.code === 'CONFLICT') {
      return res.status(409).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
});

companyCollaboratorRoutes.put('/companies/:companyId/collaborators/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: CompanyCollaboratorRole };
    const updated = await service.updateAssociation(id, { role: role as CompanyCollaboratorRole });
    res.json({
      id: updated.id,
      companyId: updated.companyId,
      collaboratorId: updated.collaboratorId,
      role: updated.role,
      status: updated.status
    });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
});

companyCollaboratorRoutes.patch('/companies/:companyId/collaborators/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: CompanyCollaboratorStatus };
    const updated = await service.toggleStatus(id, { status: status as CompanyCollaboratorStatus });
    res.json({
      id: updated.id,
      companyId: updated.companyId,
      collaboratorId: updated.collaboratorId,
      role: updated.role,
      status: updated.status
    });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
});
