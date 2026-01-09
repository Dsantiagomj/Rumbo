// Re-export validation types
export type { RegisterInput, LoginInput, UpdateProfileInput } from '../utils/validation';

// User type (matches Prisma model)
export interface IUser {
  id: string;
  email: string;
  name: string;
  preferredName: string;
  dateOfBirth: Date;
  role: string;
  image?: string | null;
  emailVerified?: Date | null;
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Public user profile (safe to expose to client)
export interface IUserProfile {
  id: string;
  email: string;
  name: string;
  preferredName: string;
  role: string;
  image?: string | null;
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;
}

// Auth session user (matches NextAuth session.user)
export interface ISessionUser {
  id: string;
  email: string;
  name: string;
  preferredName: string;
  role: string;
  image?: string | null;
}
