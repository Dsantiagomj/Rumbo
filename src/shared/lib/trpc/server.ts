/**
 * tRPC server-side caller for use in Server Components
 *
 * Note: This cannot be used at the top level as it requires async context.
 * Use it inside Server Components or Server Actions instead.
 */
import { appRouter } from './root';
import { auth } from '../auth';
import { db } from '../db';
import type { Context } from './init';

export const createTRPCContext = async (): Promise<Context> => {
  const session = await auth();
  return { session, db };
};

export const getTRPCCaller = async () => {
  const context = await createTRPCContext();
  return appRouter.createCaller(context);
};
