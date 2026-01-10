import { Request, Response, NextFunction } from 'express';
import { validationResult, query } from 'express-validator';
import { ResourceSearchService } from '../../services/resources/ResourceSearchService';
import { ApiError } from '../../errors/ApiError';

export const validateResourceSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page deve essere un intero >= 1'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('pageSize deve essere un intero compreso tra 1 e 100'),
  query('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('name deve essere una stringa non vuota'),
  query('roleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('roleId deve essere un intero valido'),
  query('roles')
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        return value.split(',').map((v) => v.trim()).filter(Boolean);
      }
      return [];
    })
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every((v) => /^\d+$/.test(String(v)));
    })
    .withMessage('roles deve essere una lista di id di ruolo numerici'),
  query('skills')
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        return value.split(',').map((v) => v.trim()).filter(Boolean);
      }
      return [];
    }),
  query('sortBy')
    .optional()
    .isIn(['name'])
    .withMessage('sortBy non valido'),
  query('sortDirection')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortDirection deve essere asc o desc'),
];

export const searchResources = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Parametri di ricerca non validi', errors.array());
    }

    const user = (req as any).user;
    if (!user || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) {
      throw ApiError.forbidden('Accesso negato: privilegi amministrativi richiesti');
    }

    const {
      name,
      roleId,
      roles,
      skills,
      page = '1',
      pageSize = '20',
      sortBy = 'name',
      sortDirection = 'asc',
    } = req.query as any;

    const numericPage = parseInt(page, 10) || 1;
    const numericPageSize = parseInt(pageSize, 10) || 20;

    const filter = {
      name: name && String(name).trim().length > 0 ? String(name).trim() : undefined,
      roleId: roleId ? parseInt(String(roleId), 10) : undefined,
      roles:
        roles && Array.isArray(roles)
          ? (roles as string[]).map((r) => parseInt(String(r), 10))
          : undefined,
      skills:
        skills && Array.isArray(skills)
          ? (skills as string[]).map((s) => String(s).trim()).filter(Boolean)
          : undefined,
      page: numericPage,
      pageSize: numericPageSize,
      sortBy: sortBy as 'name',
      sortDirection: (sortDirection as 'asc' | 'desc') || 'asc',
    };

    const service = new ResourceSearchService();
    const result = await service.searchResources(filter);

    res.json(result);
  } catch (err) {
    next(err);
  }
};
