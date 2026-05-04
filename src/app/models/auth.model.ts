import { UserProfile, UserRole } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}