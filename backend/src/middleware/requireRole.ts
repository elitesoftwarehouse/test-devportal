import { Request, Response, NextFunction } from "express";

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Utente non autenticato",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Permessi insufficienti",
      });
    }

    next();
  };
};
