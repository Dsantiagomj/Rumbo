/**
 * tRPC initialization
 * This is where we define the base tRPC context and procedures
 */
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Session } from 'next-auth';

// Define context type
export type Context = {
  session: Session | null;
};

// Create tRPC instance with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Debes iniciar sesión para acceder a este recurso',
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
