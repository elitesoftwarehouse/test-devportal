import { Request, Response, NextFunction } from 'express';

export type UserRole = 'ADMIN' | 'OWNER' | 'EXTERNAL_OWNER' | 'USER';

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    if (!allowed.includes(user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}
