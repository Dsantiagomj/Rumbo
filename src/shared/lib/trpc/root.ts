/**
 * Root tRPC router
 * This is where we merge all feature routers
 */
import { router } from './init';
import { healthRouter } from '@/features/health/api/router';
import { authRouter } from '@/features/auth/api/router';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  // Feature routers will be added here:
  // transactions: transactionsRouter,
  // bills: billsRouter,
  // budgets: budgetsRouter,
  // ai: aiRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
