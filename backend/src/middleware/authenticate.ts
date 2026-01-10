import { Request, Response, NextFunction } from 'express';

// Middleware di autenticazione placeholder da allineare con il sistema esistente
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Integrazione reale: recuperare utente da sessione/JWT
  const user = (req as any).user;

  if (!user || !user.id) {
    return res.status(401).json({ message: 'Non autorizzato' }) as any;
  }

  return next();
}
