import { Request, Response, NextFunction } from 'express';

// Middleware minimale di esempio: in produzione usare quello già esistente nel progetto.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: 'Autenticazione richiesta.' });
    return;
  }
  next();
}
