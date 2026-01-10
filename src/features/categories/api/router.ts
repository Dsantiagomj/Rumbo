/**
 * Categories Router
 * Get global and user categories
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';

export const categoriesRouter = router({
  /**
   * Get all categories (global + user custom)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.category.findMany({
      where: {
        OR: [
          { userId: null }, // Global categories
          { userId: ctx.session.user.id }, // User custom categories
        ],
      },
      orderBy: { name: 'asc' },
    });
  }),

  /**
   * Create a custom category
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        type: z.enum(['EXPENSE', 'INCOME']),
        icon: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate a unique key from the name
      const key = input.name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      // Check if category with this name already exists for this user
      const existing = await ctx.db.category.findFirst({
        where: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });

      if (existing) {
        throw new Error('Ya tienes una categoría con este nombre');
      }

      // Create custom category
      const category = await ctx.db.category.create({
        data: {
          key: `CUSTOM_${key}_${Date.now()}`, // Ensure uniqueness
          name: input.name,
          icon: input.icon || 'Tag',
          color: input.color || 'category-other',
          type: input.type,
          userId: ctx.session.user.id,
        },
      });

      return category;
    }),
});
