import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const anyReq = req as any;
  if (!anyReq.user || !anyReq.user.id) {
    res.status(401).json({ error: { code: 'auth.unauthorized' } });
    return;
  }
  next();
}
