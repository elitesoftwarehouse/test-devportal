import { Request, Response, NextFunction } from 'express';

// Middleware placeholder: si assume che un middleware di autenticazione JWT/Sessione
// abbia già popolato req.user. Qui verifichiamo solo la presenza.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: 'Utente non autenticato.' });
  }

  next();
}
