/**
 * Auth feature tRPC router
 * Handles user registration and profile management
 */
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '@/shared/lib/trpc/init';
import { db } from '@/shared/lib/db';
import { hashPassword } from '@/shared/lib/password';
import { registerBackendSchema, updateProfileSchema } from '../utils/validation';

export const authRouter = router({
  // Register a new user
  register: publicProcedure.input(registerBackendSchema).mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Ya existe un usuario con este email',
      });
    }

    // Hash password with Argon2
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        preferredName: input.preferredName,
        dateOfBirth: input.dateOfBirth,
        identification: input.identification,
        role: 'USER',
        // Default preferences from RULEBOOK
        currency: 'COP',
        language: 'es-CO',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'America/Bogota',
      },
      select: {
        id: true,
        email: true,
        name: true,
        preferredName: true,
        role: true,
        currency: true,
        language: true,
        dateFormat: true,
        timezone: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      user,
      message: `¡Bienvenido ${user.preferredName}! Tu cuenta ha sido creada exitosamente.`,
    };
  }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        preferredName: true,
        dateOfBirth: true,
        identification: true,
        role: true,
        image: true,
        currency: true,
        language: true,
        dateFormat: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // If email is being updated, check if it's already taken
    if (input.email) {
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Este email ya está en uso',
        });
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        preferredName: true,
        role: true,
        image: true,
        currency: true,
        language: true,
        dateFormat: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      user: updatedUser,
      message: 'Perfil actualizado exitosamente',
    };
  }),
});
