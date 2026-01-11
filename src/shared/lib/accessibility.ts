/**
 * Accessibility utilities for keyboard navigation and screen readers
 */

/**
 * Trap focus within a modal/dialog
 * Prevents focus from escaping the modal
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce message to screen readers
 * Uses ARIA live region pattern
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  return (
    !element.hasAttribute('aria-hidden') &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.offsetParent !== null
  );
}

/**
 * Get accessible label for an element
 * Checks aria-label, aria-labelledby, and associated label
 */
export function getAccessibleLabel(element: HTMLElement): string | null {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    return labelElement?.textContent || null;
  }

  // Check for associated label (for inputs)
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      return label?.textContent || null;
    }
  }

  return null;
}

/**
 * Keyboard event helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Check if key pressed is Enter or Space (for button-like elements)
 */
export function isActivationKey(key: string): boolean {
  return key === KeyboardKeys.ENTER || key === KeyboardKeys.SPACE;
}

/**
 * Handle keyboard navigation for a list/menu
 */
export function handleListKeyNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onIndexChange: (newIndex: number) => void,
  orientation: 'vertical' | 'horizontal' = 'vertical',
) {
  const { key } = event;

  const nextKey = orientation === 'vertical' ? KeyboardKeys.ARROW_DOWN : KeyboardKeys.ARROW_RIGHT;
  const prevKey = orientation === 'vertical' ? KeyboardKeys.ARROW_UP : KeyboardKeys.ARROW_LEFT;

  if (key === nextKey) {
    event.preventDefault();
    const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
    onIndexChange(nextIndex);
  } else if (key === prevKey) {
    event.preventDefault();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
    onIndexChange(prevIndex);
  } else if (key === KeyboardKeys.HOME) {
    event.preventDefault();
    onIndexChange(0);
  } else if (key === KeyboardKeys.END) {
    event.preventDefault();
    onIndexChange(itemCount - 1);
  }
}

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}
