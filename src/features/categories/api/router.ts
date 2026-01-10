/**
 * Categories Router
 * Get global and user categories
 */
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
});
