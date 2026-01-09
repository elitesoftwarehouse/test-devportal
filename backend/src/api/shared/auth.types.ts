export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: number;
  role: UserRole;
  email: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user: AuthUser;
}
