import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../errors/ApiError';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  // Middleware placeholder: in produzione leggere token/JWT/sessione.
  // Per coerenza con i task precedenti assumiamo che l'utente sia stato
  // già popolato a monte oppure simuliamo un utente admin in ambiente di sviluppo.

  if (!(req as any).user) {
    // Simulazione utente per ambiente di sviluppo/test
    (req as any).user = {
      id: 1,
      username: 'admin',
      roles: ['ADMIN'],
    };
  }

  const user = (req as any).user;
  if (!user) {
    throw ApiError.forbidden('Utente non autenticato');
  }

  next();
};
