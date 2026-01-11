import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Hybrid Navigation Strategy for PWA
 *
 * PWA Best Practice:
 * - Use router.push() for same-feature flows (SPA-like) to maintain state and performance
 * - Use window.location.href for context changes (MPA-like) to clear memory and refresh state
 *
 * This prevents memory leaks in long-running PWA sessions while maintaining smooth UX within features.
 */

/**
 * Routes that should use router.push() (SPA behavior)
 * These are same-feature flows where maintaining state is beneficial
 */
const SPA_ROUTES = [
  '/products/new',
  '/products/new/import',
  '/products/new/manual',
  '/dashboard', // Quick navigation within dashboard sections
] as const;

/**
 * Routes that should use window.location.href (MPA behavior)
 * These are context changes where memory should be cleared
 */
const MPA_ROUTES = ['/settings', '/auth/login', '/auth/register', '/auth/logout'] as const;

/**
 * Determines if a route should use SPA-style navigation
 */
function shouldUseSPA(href: string): boolean {
  return SPA_ROUTES.some((route) => href.startsWith(route));
}

/**
 * Determines if a route should use MPA-style navigation
 */
function shouldUseMPA(href: string): boolean {
  return MPA_ROUTES.some((route) => href.startsWith(route));
}

/**
 * Navigate using hybrid strategy
 *
 * @param href - The destination URL
 * @param router - Next.js router instance (optional if using MPA route)
 *
 * @example
 * ```tsx
 * // In a client component
 * const router = useRouter();
 *
 * // SPA navigation (within feature)
 * navigate('/products/new/import', router);
 *
 * // MPA navigation (context change)
 * navigate('/settings/profile'); // router not needed
 * ```
 */
export function navigate(href: string, router?: AppRouterInstance): void {
  if (shouldUseMPA(href)) {
    // Context change: Use window.location for memory cleanup
    window.location.href = href;
  } else if (shouldUseSPA(href)) {
    // Same feature: Use router.push for SPA experience
    if (!router) {
      console.warn(
        `navigate(): SPA route "${href}" requires router instance. Falling back to window.location.href`,
      );
      window.location.href = href;
      return;
    }
    router.push(href);
  } else {
    // Default: Use router if available, otherwise window.location
    if (router) {
      router.push(href);
    } else {
      window.location.href = href;
    }
  }
}

/**
 * Determines if a route uses SPA-style navigation
 * Useful for conditional rendering or analytics
 */
export function isSPARoute(href: string): boolean {
  return shouldUseSPA(href);
}

/**
 * Determines if a route uses MPA-style navigation
 * Useful for conditional rendering or analytics
 */
export function isMPARoute(href: string): boolean {
  return shouldUseMPA(href);
}
