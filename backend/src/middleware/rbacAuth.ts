import { NextFunction, Response } from 'express';
import { UserRole } from '../constants/roles';
import { RequestWithSession } from '../types/session';

/**
 * Middleware di autenticazione base.
 * - Verifica che l'utente sia presente in sessione (req.session.user) o in req.authUser
 * - In caso contrario restituisce 401 con messaggio generico.
 *
 * Da utilizzare quando serve solo verificare che l'utente sia loggato,
 * senza controlli di ruolo specifici.
 */
export function requireAuthenticated(
  req: RequestWithSession,
  res: Response,
  next: NextFunction,
): void {
  const user = resolveRequestUser(req);

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Accesso non autorizzato',
    });
    return;
  }

  // Normalizziamo l'utente sulla request per gli handler successivi
  (req as any).currentUser = user;
  next();
}

/**
 * Factory di middleware RBAC.
 *
 * Esempio di utilizzo:
 *   router.get('/admin-only', requireRoles([UserRole.SYS_ADMIN]), handler);
 *
 * - Verifica che l'utente sia autenticato (altrimenti 401).
 * - Se rolesRequired è vuoto o non fornito: basta essere autenticati.
 * - Se rolesRequired è valorizzato: verifica che l'utente abbia almeno uno dei ruoli richiesti,
 *   altrimenti restituisce 403.
 */
export function requireRoles(rolesRequired?: UserRole[]) {
  return function rbacMiddleware(
    req: RequestWithSession,
    res: Response,
    next: NextFunction,
  ): void {
    const user = resolveRequestUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Accesso non autorizzato',
      });
      return;
    }

    // Nessun ruolo specifico richiesto: basta essere autenticati
    if (!rolesRequired || rolesRequired.length === 0) {
      (req as any).currentUser = user;
      next();
      return;
    }

    const userRoles = user.roles || [];
    const hasRequiredRole = rolesRequired.some((required) =>
      userRoles.includes(required),
    );

    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        error: 'Accesso non autorizzato',
      });
      return;
    }

    (req as any).currentUser = user;
    next();
  };
}

/**
 * Funzione di utilità per individuare l'utente dalla request.
 * Adatta a diversi meccanismi di sessione/token:
 * - req.session.user: tipico di sessioni server-side
 * - req.authUser: per integrazione con middleware JWT esistente
 */
function resolveRequestUser(req: RequestWithSession) {
  if (req.session && req.session.user) {
    return req.session.user;
  }

  if (req.authUser) {
    return req.authUser;
  }

  return (req as any).currentUser || null;
}

export default {
  requireAuthenticated,
  requireRoles,
};
