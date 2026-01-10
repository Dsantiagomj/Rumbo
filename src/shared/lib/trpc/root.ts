/**
 * Root tRPC router
 * This is where we merge all feature routers
 */
import { router } from './init';
import { healthRouter } from '@/features/health/api/router';
import { authRouter } from '@/features/auth/api/router';
import { importRouter } from '@/features/import/api/router';
import { accountsRouter } from '@/features/accounts/api/router';
import { categoriesRouter } from '@/features/categories/api/router';
import { tasksRouter } from '@/features/tasks/api/router';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  // Epic 2: Smart Data Import
  import: importRouter,
  accounts: accountsRouter,
  categories: categoriesRouter,
  tasks: tasksRouter,
  // Future feature routers:
  // bills: billsRouter,
  // budgets: budgetsRouter,
  // ai: aiRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
