/**
 * tRPC server-side caller for use in Server Components
 */
import { appRouter } from './root';

export const trpcServer = appRouter.createCaller({});
