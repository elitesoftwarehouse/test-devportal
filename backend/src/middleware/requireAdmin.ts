import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || !user.roles || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permessi insufficienti' });
  }
  next();
}
