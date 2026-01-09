import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../errors/httpErrors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return next(new ForbiddenError('Utente non autenticato'));
  }

  if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) {
    return next(new ForbiddenError('Permessi insufficienti'));
  }

  return next();
}
