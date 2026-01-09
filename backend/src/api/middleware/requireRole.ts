import { Request, Response, NextFunction } from 'express';

export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes(requiredRole)) {
      return res.status(403).json({ message: 'Accesso negato. Ruolo non autorizzato.' });
    }

    next();
  };
}
