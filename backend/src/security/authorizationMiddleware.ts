import { Request, Response, NextFunction } from 'express';

// Middleware di autorizzazione di base che si integra con il sistema esistente.
// Si assume che req.user sia popolato da un middleware di autenticazione precedente
// e che contenga un array di ruoli.

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user: any = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: 'Autenticazione richiesta' });
  }

  const roles: string[] = user.roles || [];

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Accesso negato: permessi insufficienti' });
  }

  return next();
}
