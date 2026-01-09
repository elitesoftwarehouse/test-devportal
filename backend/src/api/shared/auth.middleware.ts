import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser, UserRole } from './auth.types';

// Middleware di autenticazione semplificato / placeholder.
// Nell'implementazione reale leggerà il token JWT o la sessione.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Placeholder: utente fittizio come ADMIN per permettere test rapido.
  const fakeUser: AuthUser = {
    id: 1,
    role: UserRole.ADMIN,
    email: 'admin@example.com',
  };

  (req as AuthenticatedRequest).user = fakeUser;
  next();
}
