import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CompanyCollaboratorService } from '../services/companyCollaborator.service';

const router = Router();
const service = new CompanyCollaboratorService();

// GET /api/companies/:companyId/collaborators
router.get(
  '/:companyId/collaborators',
  [param('companyId').isInt({ gt: 0 }).toInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyId } = req.params as { companyId: string };

    try {
      const collaborators = await service.listByCompanyId(parseInt(companyId, 10));
      return res.json(collaborators);
    } catch (error: any) {
      console.error('Error fetching company collaborators', error);
      return res.status(500).json({ message: 'Errore nel recupero dei collaboratori associati all\'azienda.' });
    }
  }
);

// POST /api/companies/:companyId/collaborators
router.post(
  '/:companyId/collaborators',
  [
    param('companyId').isInt({ gt: 0 }).toInt(),
    body('collaboratorId').optional().isInt({ gt: 0 }).toInt(),
    body('createNew').optional().isBoolean().toBoolean(),
    body('name').optional().isString().isLength({ min: 1 }),
    body('email').optional().isString().isLength({ min: 1 }),
    body('phone').optional().isString(),
    body('role').isString().isLength({ min: 1 }),
    body('status').isIn(['ACTIVE', 'INACTIVE'])
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyId } = req.params as { companyId: string };
    const { collaboratorId, createNew, name, email, phone, role, status } = req.body as {
      collaboratorId?: number;
      createNew?: boolean;
      name?: string;
      email?: string;
      phone?: string;
      role: string;
      status: 'ACTIVE' | 'INACTIVE';
    };

    try {
      const association = await service.addToCompany({
        companyId: parseInt(companyId, 10),
        collaboratorId,
        createNew: !!createNew,
        name,
        email,
        phone,
        role,
        status
      });
      return res.status(201).json(association);
    } catch (error: any) {
      console.error('Error adding collaborator to company', error);
      if (error && error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Errore nell\'aggiunta del collaboratore all\'azienda.' });
    }
  }
);

// PUT /api/companies/:companyId/collaborators/:associationId
router.put(
  '/:companyId/collaborators/:associationId',
  [
    param('companyId').isInt({ gt: 0 }).toInt(),
    param('associationId').isInt({ gt: 0 }).toInt(),
    body('role').optional().isString().isLength({ min: 1 }),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
    body('email').optional().isString().isLength({ min: 1 }),
    body('phone').optional().isString()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyId, associationId } = req.params as { companyId: string; associationId: string };
    const { role, status, email, phone } = req.body as {
      role?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      email?: string;
      phone?: string;
    };

    try {
      const updated = await service.updateAssociation({
        companyId: parseInt(companyId, 10),
        associationId: parseInt(associationId, 10),
        role,
        status,
        email,
        phone
      });
      return res.json(updated);
    } catch (error: any) {
      console.error('Error updating company collaborator association', error);
      if (error && error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Errore nell\'aggiornamento del collaboratore associato all\'azienda.' });
    }
  }
);

// PATCH /api/companies/:companyId/collaborators/:associationId/status
router.patch(
  '/:companyId/collaborators/:associationId/status',
  [
    param('companyId').isInt({ gt: 0 }).toInt(),
    param('associationId').isInt({ gt: 0 }).toInt(),
    body('status').isIn(['ACTIVE', 'INACTIVE'])
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyId, associationId } = req.params as { companyId: string; associationId: string };
    const { status } = req.body as { status: 'ACTIVE' | 'INACTIVE' };

    try {
      const updated = await service.updateStatus({
        companyId: parseInt(companyId, 10),
        associationId: parseInt(associationId, 10),
        status
      });
      return res.json(updated);
    } catch (error: any) {
      console.error('Error updating company collaborator status', error);
      if (error && error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Errore nella modifica dello stato del collaboratore associato all\'azienda.' });
    }
  }
);

export default router;
