/**
 * Health check feature router
 * Example of feature-based tRPC router
 */
import { z } from 'zod';
import { router, publicProcedure } from '@/shared/lib/trpc/init';

export const healthRouter = router({
  // Simple health check
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }),

  // Echo endpoint with input validation
  echo: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(100),
      }),
    )
    .query(({ input }) => {
      return {
        message: input.message,
        echo: `You said: ${input.message}`,
        timestamp: new Date(),
      };
    }),
});
