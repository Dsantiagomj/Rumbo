/**
 * Tasks Router
 * Manage user tasks (import reminders, etc.)
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';

export const tasksRouter = router({
  /**
   * Get all pending tasks for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        status: 'PENDING',
      },
      orderBy: { dueDate: 'asc' },
    });
  }),

  /**
   * Mark task as completed
   */
  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: { id: input.id },
        data: { status: 'COMPLETED' },
      });
    }),
});
