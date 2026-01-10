import type { User } from '@prisma/client';

/**
 * Create a complete mock user with all required fields
 * for use in integration tests
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    preferredName: 'Test',
    role: 'USER',
    currency: 'COP',
    language: 'es-CO',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'America/Bogota',
    image: null,
    dateOfBirth: new Date('1996-12-19'),
    identification: null,
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
