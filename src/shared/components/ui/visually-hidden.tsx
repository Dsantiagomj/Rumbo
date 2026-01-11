/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 *
 * @example
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 */

import { cn } from '@/shared/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function VisuallyHidden({
  children,
  className,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'absolute h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap',
        '[clip:rect(0,0,0,0)]',
        className,
      )}
    >
      {children}
    </Component>
  );
}

// Export as sr-only class name for use in className strings
export const srOnly =
  'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]';
