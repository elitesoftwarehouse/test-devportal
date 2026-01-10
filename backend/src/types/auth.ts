import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
