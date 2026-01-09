import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { CompanyFirstAccreditationService } from '../../services/companyFirstAccreditation.service';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { logger } from '../../infrastructure/logger';

const router = Router();

// Utility per gestione errori di validazione
const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error on company first accreditation request', {
      errors: errors.array(),
      path: req.path,
      userId: (req as any).user?.id || null
    });
    return res.status(400).json({
      message: 'Dati non validi',
      errors: errors.array()
    });
  }
  next();
};

// POST /companies/first-accreditation
router.post(
  '/companies/first-accreditation',
  requireAuth,
  requireRole('EXTERNAL_OWNER'),
  [
    body('ragioneSociale').isString().notEmpty().withMessage('Ragione sociale obbligatoria'),
    body('partitaIva').isString().notEmpty().withMessage('Partita IVA obbligatoria'),
    body('codiceFiscale').optional().isString(),
    body('sedeLegale.indirizzo').isString().notEmpty().withMessage('Indirizzo sede legale obbligatorio'),
    body('sedeLegale.cap').isString().notEmpty().withMessage('CAP sede legale obbligatorio'),
    body('sedeLegale.citta').isString().notEmpty().withMessage('Città sede legale obbligatoria'),
    body('sedeLegale.provincia').isString().notEmpty().withMessage('Provincia sede legale obbligatoria'),
    body('email').isEmail().withMessage('Email aziendale non valida')
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
      const service = new CompanyFirstAccreditationService();
      const result = await service.createDraftWithOwner({
        ragioneSociale: req.body.ragioneSociale,
        partitaIva: req.body.partitaIva,
        codiceFiscale: req.body.codiceFiscale,
        sedeLegale: req.body.sedeLegale,
        email: req.body.email,
        telefono: req.body.telefono,
        currentUserId: user.id
      });

      logger.info('Created company draft for first accreditation', {
        companyId: result.id,
        userId: user.id
      });

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error creating company draft for first accreditation', {
        error: error?.message,
        stack: error?.stack,
        userId: user.id
      });

      if (error.code === 'COMPANY_VAT_CONFLICT') {
        return res.status(409).json({ message: error.message, code: error.code });
      }

      return res.status(500).json({ message: 'Errore interno durante la creazione della bozza azienda.' });
    }
  }
);

// PUT /companies/:id/first-accreditation (completamento e conferma)
router.put(
  '/companies/:id/first-accreditation',
  requireAuth,
  requireRole('EXTERNAL_OWNER'),
  [
    param('id').isInt().toInt(),
    body('ragioneSociale').isString().notEmpty().withMessage('Ragione sociale obbligatoria'),
    body('partitaIva').isString().notEmpty().withMessage('Partita IVA obbligatoria'),
    body('codiceFiscale').optional().isString(),
    body('sedeLegale.indirizzo').isString().notEmpty().withMessage('Indirizzo sede legale obbligatorio'),
    body('sedeLegale.cap').isString().notEmpty().withMessage('CAP sede legale obbligatorio'),
    body('sedeLegale.citta').isString().notEmpty().withMessage('Città sede legale obbligatoria'),
    body('sedeLegale.provincia').isString().notEmpty().withMessage('Provincia sede legale obbligatoria'),
    body('email').isEmail().withMessage('Email aziendale non valida')
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const companyId = Number(req.params.id);

    try {
      const service = new CompanyFirstAccreditationService();
      const result = await service.completeAndConfirmFirstAccreditation({
        companyId,
        ragioneSociale: req.body.ragioneSociale,
        partitaIva: req.body.partitaIva,
        codiceFiscale: req.body.codiceFiscale,
        sedeLegale: req.body.sedeLegale,
        email: req.body.email,
        telefono: req.body.telefono,
        currentUserId: user.id
      });

      logger.info('Confirmed first accreditation for company', {
        companyId: result.id,
        userId: user.id
      });

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error confirming first accreditation for company', {
        error: error?.message,
        stack: error?.stack,
        userId: user.id,
        companyId
      });

      if (error.code === 'COMPANY_NOT_FOUND') {
        return res.status(404).json({ message: error.message, code: error.code });
      }

      if (error.code === 'COMPANY_FORBIDDEN') {
        return res.status(403).json({ message: error.message, code: error.code });
      }

      if (error.code === 'COMPANY_VAT_CONFLICT') {
        return res.status(409).json({ message: error.message, code: error.code });
      }

      return res.status(500).json({ message: 'Errore interno durante la conferma del primo accreditamento.' });
    }
  }
);

// GET /companies/:id (visualizzazione dati base azienda per owner)
router.get(
  '/companies/:id',
  requireAuth,
  requireRole('EXTERNAL_OWNER'),
  [param('id').isInt().toInt()],
  handleValidation,
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const companyId = Number(req.params.id);

    try {
      const service = new CompanyFirstAccreditationService();
      const company = await service.getCompanyForOwner(companyId, user.id);

      if (!company) {
        return res.status(404).json({ message: 'Azienda non trovata.' });
      }

      return res.status(200).json(company);
    } catch (error: any) {
      logger.error('Error fetching company for owner', {
        error: error?.message,
        stack: error?.stack,
        userId: user.id,
        companyId
      });

      if (error.code === 'COMPANY_FORBIDDEN') {
        return res.status(403).json({ message: error.message, code: error.code });
      }

      return res.status(500).json({ message: 'Errore interno durante il recupero dei dati aziendali.' });
    }
  }
);

export { router as companyFirstAccreditationRouter };