import { Request, Response, NextFunction } from 'express';

export type UserRole = 'STANDARD' | 'IT_OPERATOR' | 'ADMIN';

export interface AuthUser {
  id: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }
  next();
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permessi insufficienti' });
    }
    next();
  };
}
