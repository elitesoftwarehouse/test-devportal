import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: string;
  roles: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const mockAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const roleHeader = req.header('x-mock-role');
  const roles = roleHeader ? [roleHeader] : [];
  req.user = {
    id: 'test-user',
    roles
  };
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Non autorizzato: ruolo Amministratore richiesto' });
  }
  next();
};
