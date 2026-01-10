import { Request, Response, NextFunction } from 'express';

export function ensureAdmin(req: Request, res: Response, next: NextFunction): void {
  const user: any = (req as any).user;

  if (!user) {
    res.status(401).json({ message: 'Non autenticato' });
    return;
  }

  if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) {
    res.status(403).json({ message: 'Accesso negato' });
    return;
  }

  next();
}
