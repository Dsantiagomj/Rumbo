/**
 * tRPC API route handler for Next.js App Router
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/shared/lib/trpc/root';
import { auth } from '@/shared/lib/auth';
import type { Context } from '@/shared/lib/trpc/init';

const handler = async (req: Request) => {
  // Get session from NextAuth
  const session = await auth();

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (): Context => ({
      session,
    }),
  });
};

export { handler as GET, handler as POST };
