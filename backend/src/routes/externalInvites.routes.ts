import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { ExternalInviteService } from '../services/ExternalInviteService';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();
const inviteService = new ExternalInviteService();

// Middleware di validazione generica
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
}

// POST /api/external-invites
router.post(
  '/',
  requireAuth,
  requireRole('EXTERNAL_OWNER'),
  [
    body('email')
      .isString().withMessage('Email obbligatoria')
      .isEmail().withMessage('Formato email non valido')
      .isLength({ max: 255 }).withMessage('Email troppo lunga'),
    body('firstName')
      .optional({ nullable: true })
      .isString().withMessage('Nome non valido')
      .isLength({ max: 100 }).withMessage('Nome troppo lungo'),
    body('lastName')
      .optional({ nullable: true })
      .isString().withMessage('Cognome non valido')
      .isLength({ max: 100 }).withMessage('Cognome troppo lungo'),
    body('message')
      .optional({ nullable: true })
      .isString().withMessage('Messaggio non valido')
      .isLength({ max: 1000 }).withMessage('Messaggio troppo lungo'),
    body('companyId')
      .optional({ nullable: true })
      .isString().withMessage('companyId non valido')
      .isLength({ max: 50 }).withMessage('companyId troppo lungo')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { email, firstName, lastName, message, companyId } = req.body;

      const result = await inviteService.createInvite({
        ownerUserId: user.id,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        message: message || null,
        companyId: companyId || null
      });

      return res.status(201).json(result);
    } catch (err: any) {
      if (err.code === 'INVITE_ALREADY_EXISTS') {
        return res.status(409).json({
          error: 'EMAIL_ALREADY_INVITED',
          message: 'Questa email è già stata invitata.'
        });
      }
      if (err.code === 'FORBIDDEN_COMPANY') {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Non hai i permessi per invitare per questa azienda.'
        });
      }
      console.error('Error creating external invite', err);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Errore imprevisto durante la creazione dell\'invito.'
      });
    }
  }
);

// GET /api/external-invites
router.get(
  '/',
  requireAuth,
  requireRole('EXTERNAL_OWNER'),
  [
    query('companyId')
      .optional({ nullable: true })
      .isString().withMessage('companyId non valido')
      .isLength({ max: 50 }).withMessage('companyId troppo lungo')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { companyId } = req.query as { companyId?: string };

      const invites = await inviteService.listInvites({
        ownerUserId: user.id,
        companyId: companyId || null
      });

      return res.json(invites);
    } catch (err: any) {
      console.error('Error listing external invites', err);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante il recupero degli inviti.'
      });
    }
  }
);

export default router;
