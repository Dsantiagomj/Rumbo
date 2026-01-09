export { auth as middleware } from '@/shared/lib/auth';

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
