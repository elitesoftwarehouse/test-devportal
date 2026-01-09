import { Router, Response } from 'express';
import { requireRoles } from '../middleware/rbacAuth';
import { UserRole } from '../constants/roles';
import { RequestWithSession } from '../types/session';

const router = Router();

// Endpoint accessibile solo a SYS_ADMIN
router.get(
  '/rbac/sys-admin-only',
  requireRoles([UserRole.SYS_ADMIN]),
  (req: RequestWithSession, res: Response) => {
    const currentUser = (req as any).currentUser;
    res.json({
      success: true,
      data: {
        message: 'Endpoint riservato ai SYS_ADMIN',
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          roles: currentUser?.roles,
        },
      },
    });
  },
);

// Endpoint accessibile solo a IT_OPERATOR
router.get(
  '/rbac/it-operator-only',
  requireRoles([UserRole.IT_OPERATOR]),
  (req: RequestWithSession, res: Response) => {
    const currentUser = (req as any).currentUser;
    res.json({
      success: true,
      data: {
        message: 'Endpoint riservato agli IT_OPERATOR',
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          roles: currentUser?.roles,
        },
      },
    });
  },
);

// Endpoint accessibile solo a utenti esterni (owner o collaborator)
router.get(
  '/rbac/external-only',
  requireRoles([UserRole.EXTERNAL_OWNER, UserRole.EXTERNAL_COLLABORATOR]),
  (req: RequestWithSession, res: Response) => {
    const currentUser = (req as any).currentUser;
    res.json({
      success: true,
      data: {
        message:
          'Endpoint riservato agli utenti esterni (owner o collaborator)',
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          roles: currentUser?.roles,
        },
      },
    });
  },
);

// Endpoint generico per utenti autenticati, senza vincoli di ruolo specifici
router.get(
  '/rbac/authenticated-generic',
  requireRoles(),
  (req: RequestWithSession, res: Response) => {
    const currentUser = (req as any).currentUser;
    res.json({
      success: true,
      data: {
        message: 'Endpoint accessibile a qualsiasi utente autenticato',
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          roles: currentUser?.roles,
        },
      },
    });
  },
);

export default router;
