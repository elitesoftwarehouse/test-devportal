import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { SupplierCompany } from '../../models/SupplierCompany';
import { requireAdmin } from '../../security/authorizationMiddleware';

const router = Router();

// Validazioni comuni lato backend (allineate al frontend)
const supplierCompanyValidators = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('La ragione sociale è obbligatoria')
    .isLength({ max: 255 })
    .withMessage('La ragione sociale non può superare 255 caratteri'),
  body('vatNumber')
    .trim()
    .notEmpty()
    .withMessage('La partita IVA è obbligatoria')
    .isLength({ min: 8, max: 20 })
    .withMessage('La partita IVA deve avere tra 8 e 20 caratteri'),
  body('taxCode')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Il codice fiscale non può superare 20 caratteri'),
  body('addressStreet').optional({ nullable: true }).trim().isLength({ max: 255 }),
  body('addressCity').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('addressZip').optional({ nullable: true }).trim().isLength({ max: 10 }),
  body('addressProvince').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('addressCountry').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Il telefono non può superare 30 caratteri'),
  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('Formato email non valido')
    .isLength({ max: 255 })
    .withMessage('L\'email non può superare 255 caratteri'),
  body('pec')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('Formato PEC non valido')
    .isLength({ max: 255 })
    .withMessage('La PEC non può superare 255 caratteri'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Stato non valido'),
];

// Middleware per gestione errori di validazione
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errore di validazione',
      errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
    });
  }
  return next();
}

// GET /api/admin/supplier-companies
// Lista con filtri (ragione sociale, partita IVA, stato)
router.get(
  '/',
  requireAdmin,
  [
    query('search').optional().isString(),
    query('vatNumber').optional().isString(),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, vatNumber, status } = req.query as {
        search?: string;
        vatNumber?: string;
        status?: 'ACTIVE' | 'INACTIVE';
      };

      const where: any = {};

      if (search) {
        // ricerca semplice: ragione sociale LIKE %search%
        where.businessName = { $like: `%${search}%` };
      }

      if (vatNumber) {
        where.vatNumber = { $like: `%${vatNumber}%` };
      }

      if (status) {
        where.status = status;
      }

      const suppliers = await SupplierCompany.findAll({
        where,
        order: [['businessName', 'ASC']],
      });

      return res.json(suppliers);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/admin/supplier-companies/:id
router.get(
  '/:id',
  requireAdmin,
  [param('id').isInt()],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const supplier = await SupplierCompany.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ message: 'Azienda fornitrice non trovata' });
      }
      return res.json(supplier);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /api/admin/supplier-companies
router.post(
  '/',
  requireAdmin,
  supplierCompanyValidators,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      // Normalizzazione base
      data.businessName = data.businessName?.trim();
      data.vatNumber = data.vatNumber?.trim();

      try {
        const created = await SupplierCompany.create({
          businessName: data.businessName,
          vatNumber: data.vatNumber,
          taxCode: data.taxCode || null,
          addressStreet: data.addressStreet || null,
          addressCity: data.addressCity || null,
          addressZip: data.addressZip || null,
          addressProvince: data.addressProvince || null,
          addressCountry: data.addressCountry || null,
          phone: data.phone || null,
          email: data.email || null,
          pec: data.pec || null,
          status: data.status || 'ACTIVE',
        });

        return res.status(201).json(created);
      } catch (err: any) {
        // Gestione conflitto partita IVA duplicata
        if (err && err.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({
            message: 'Esiste già un\'azienda con la stessa partita IVA',
            code: 'VAT_NUMBER_CONFLICT',
          });
        }
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/admin/supplier-companies/:id
router.put(
  '/:id',
  requireAdmin,
  [param('id').isInt()],
  supplierCompanyValidators,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const supplier = await SupplierCompany.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ message: 'Azienda fornitrice non trovata' });
      }

      const data = req.body;
      data.businessName = data.businessName?.trim();
      data.vatNumber = data.vatNumber?.trim();

      try {
        supplier.businessName = data.businessName;
        supplier.vatNumber = data.vatNumber;
        supplier.taxCode = data.taxCode || null;
        supplier.addressStreet = data.addressStreet || null;
        supplier.addressCity = data.addressCity || null;
        supplier.addressZip = data.addressZip || null;
        supplier.addressProvince = data.addressProvince || null;
        supplier.addressCountry = data.addressCountry || null;
        supplier.phone = data.phone || null;
        supplier.email = data.email || null;
        supplier.pec = data.pec || null;
        supplier.status = data.status || supplier.status;

        await supplier.save();

        return res.json(supplier);
      } catch (err: any) {
        if (err && err.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({
            message: 'Esiste già un\'azienda con la stessa partita IVA',
            code: 'VAT_NUMBER_CONFLICT',
          });
        }
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  }
);

// PATCH /api/admin/supplier-companies/:id/status
router.patch(
  '/:id/status',
  requireAdmin,
  [param('id').isInt(), body('status').isIn(['ACTIVE', 'INACTIVE'])],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const supplier = await SupplierCompany.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ message: 'Azienda fornitrice non trovata' });
      }

      supplier.status = req.body.status;
      await supplier.save();

      return res.json(supplier);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
