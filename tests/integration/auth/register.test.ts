import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from '@/shared/lib/trpc/root';
import { db } from '@/shared/lib/db';
import { hashPassword } from '@/shared/lib/password';

// Mock the database
vi.mock('@/shared/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock password hashing
vi.mock('@/shared/lib/password', () => ({
  hashPassword: vi.fn(),
}));

describe('Auth Router - Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully registers a new user', async () => {
    const mockHashedPassword = 'hashed_password_123';
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferredName: 'Test',
      role: 'USER',
      currency: 'COP',
      language: 'es-CO',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/Bogota',
      createdAt: new Date(),
    };

    // Mock implementations
    vi.mocked(db.user.findUnique).mockResolvedValue(null); // User doesn't exist
    vi.mocked(hashPassword).mockResolvedValue(mockHashedPassword);
    vi.mocked(db.user.create).mockResolvedValue({
      ...mockUser,
      password: mockHashedPassword,
      image: null,
      dateOfBirth: new Date('1996-12-19'),
      identification: null,
      emailVerified: null,
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller({ session: null, db });
    const result = await caller.auth.register({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
      preferredName: 'Test',
      dateOfBirth: new Date('1996-12-19'),
    });

    // Verify result
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.user.preferredName).toBe('Test');
    expect(result.message).toContain('Test');

    // Verify mocks were called correctly
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(hashPassword).toHaveBeenCalledWith('SecurePass123!');
    expect(db.user.create).toHaveBeenCalled();
  });

  it('rejects registration with existing email', async () => {
    const existingUser = {
      id: 'existing-user',
      email: 'existing@example.com',
      password: 'hashed',
      name: 'Existing User',
      preferredName: 'Existing',
      role: 'USER',
      currency: 'COP',
      language: 'es-CO',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/Bogota',
      image: null,
      dateOfBirth: new Date(),
      identification: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.user.findUnique).mockResolvedValue(existingUser);

    const caller = appRouter.createCaller({ session: null, db });

    await expect(() =>
      caller.auth.register({
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        preferredName: 'New',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow('Ya existe un usuario con este email');

    // Verify password was not hashed
    expect(hashPassword).not.toHaveBeenCalled();
    // Verify user was not created
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const caller = appRouter.createCaller({ session: null, db });

    // Missing email
    await expect(() =>
      caller.auth.register({
        email: '',
        password: 'SecurePass123!',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // Missing password
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: '',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // Missing name
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: '',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // Missing preferredName
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        preferredName: '',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();
  });

  it('validates email format', async () => {
    const caller = appRouter.createCaller({ session: null, db });

    await expect(() =>
      caller.auth.register({
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();
  });

  it('validates password requirements', async () => {
    const caller = appRouter.createCaller({ session: null, db });

    // Password too short
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'Short1',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // No uppercase
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'nouppercase1',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // No lowercase
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'NOLOWERCASE1',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();

    // No number
    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'NoNumberPass',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: new Date('1996-12-19'),
      }),
    ).rejects.toThrow();
  });

  it('validates age requirement (minimum 13 years)', async () => {
    const caller = appRouter.createCaller({ session: null, db });
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 12); // 12 years old

    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: tooYoung,
      }),
    ).rejects.toThrow('al menos 13 años');
  });

  it('rejects future dates of birth', async () => {
    const caller = appRouter.createCaller({ session: null, db });
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await expect(() =>
      caller.auth.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        preferredName: 'Test',
        dateOfBirth: futureDate,
      }),
    ).rejects.toThrow();
  });
});
