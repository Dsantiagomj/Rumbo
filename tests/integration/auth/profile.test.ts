import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from '@/shared/lib/trpc/root';
import { db } from '@/shared/lib/db';
import { createMockUser } from '../../helpers/mock-user';

// Mock the database
vi.mock('@/shared/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Auth Router - Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferredName: 'Test',
      role: 'USER',
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockUser = createMockUser({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    preferredName: 'Test',
    dateOfBirth: new Date('1996-12-19'),
  });

  describe('getProfile', () => {
    it('successfully fetches user profile', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

      const caller = appRouter.createCaller({ session: mockSession, db });
      const result = await caller.auth.getProfile();

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.preferredName).toBe('Test');
      expect(result.currency).toBe('COP');
      expect(result.language).toBe('es-CO');
      expect(result.dateFormat).toBe('DD/MM/YYYY');
      expect(result.timezone).toBe('America/Bogota');

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          preferredName: true,
          image: true,
          currency: true,
          language: true,
          dateFormat: true,
          timezone: true,
          role: true,
          dateOfBirth: true,
          createdAt: true,
        }),
      });
    });

    it('throws error when user not found', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() => caller.auth.getProfile()).rejects.toThrow('Usuario no encontrado');
    });

    it('throws error when not authenticated', async () => {
      const caller = appRouter.createCaller({ session: null, db });

      await expect(() => caller.auth.getProfile()).rejects.toThrow(
        'Debes iniciar sesión para acceder a este recurso',
      );
    });
  });

  describe('updateProfile', () => {
    it('successfully updates profile with all fields', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        preferredName: 'UpdatedPreferred',
        email: 'updated@example.com',
        currency: 'USD',
        language: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'America/New_York',
      };

      vi.mocked(db.user.findUnique).mockResolvedValue(null); // No email conflict
      vi.mocked(db.user.update).mockResolvedValue(updatedUser);

      const caller = appRouter.createCaller({ session: mockSession, db });
      const result = await caller.auth.updateProfile({
        name: 'Updated Name',
        preferredName: 'UpdatedPreferred',
        email: 'updated@example.com',
        currency: 'USD',
        language: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'America/New_York',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('actualizado exitosamente');
      expect(result.user.name).toBe('Updated Name');
      expect(result.user.email).toBe('updated@example.com');
      expect(result.user.currency).toBe('USD');
      expect(result.user.language).toBe('en-US');
      expect(result.user.dateFormat).toBe('MM/DD/YYYY');
      expect(result.user.timezone).toBe('America/New_York');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          name: 'Updated Name',
          preferredName: 'UpdatedPreferred',
          email: 'updated@example.com',
          currency: 'USD',
          language: 'en-US',
          dateFormat: 'MM/DD/YYYY',
          timezone: 'America/New_York',
        }),
        select: expect.any(Object),
      });
    });

    it('successfully updates partial profile (only name)', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'New Name Only',
      };

      vi.mocked(db.user.update).mockResolvedValue(updatedUser);

      const caller = appRouter.createCaller({ session: mockSession, db });
      const result = await caller.auth.updateProfile({
        name: 'New Name Only',
      });

      expect(result.success).toBe(true);
      expect(result.user.name).toBe('New Name Only');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'New Name Only' },
        select: expect.any(Object),
      });
    });

    it('rejects update with duplicate email', async () => {
      const existingUser = createMockUser({
        id: 'another-user',
        email: 'existing@example.com',
      });

      vi.mocked(db.user.findUnique).mockResolvedValue(existingUser);

      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          email: 'existing@example.com',
        }),
      ).rejects.toThrow('Este email ya está en uso');

      expect(db.user.update).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          email: 'invalid-email',
        }),
      ).rejects.toThrow();
    });

    it('validates currency enum', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          // @ts-expect-error Testing invalid currency value
          currency: 'INVALID',
        }),
      ).rejects.toThrow();
    });

    it('validates language enum', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          // @ts-expect-error Testing invalid language value
          language: 'INVALID',
        }),
      ).rejects.toThrow();
    });

    it('validates date format enum', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          // @ts-expect-error Testing invalid date format value
          dateFormat: 'INVALID',
        }),
      ).rejects.toThrow();
    });

    it('validates name minimum length', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          name: 'A',
        }),
      ).rejects.toThrow();
    });

    it('validates preferred name minimum length', async () => {
      const caller = appRouter.createCaller({ session: mockSession, db });

      await expect(() =>
        caller.auth.updateProfile({
          preferredName: 'A',
        }),
      ).rejects.toThrow();
    });

    it('throws error when not authenticated', async () => {
      const caller = appRouter.createCaller({ session: null, db });

      await expect(() =>
        caller.auth.updateProfile({
          name: 'Test',
        }),
      ).rejects.toThrow('Debes iniciar sesión para acceder a este recurso');
    });
  });
});
