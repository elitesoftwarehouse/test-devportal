import { UserRole } from '../constants/roles';

export interface SessionUser {
  id: string;
  email: string;
  fullName?: string;
  roles: UserRole[];
}

export interface RequestSession {
  user?: SessionUser | null;
}

// Estensione del tipo Request di Express usato nel progetto
// (assumendo Express come negli altri task)
import { Request } from 'express';

export interface RequestWithSession extends Request {
  session?: RequestSession;
  // In alternativa, se viene usato un token JWT, si può usare req.authUser / req.user
  authUser?: SessionUser | null;
}
