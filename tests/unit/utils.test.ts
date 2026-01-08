import { describe, it, expect } from 'vitest';
import { cn } from '@/shared/lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isIncluded = false;
     
    const result = cn('base', isIncluded && 'not-included', 'included');
    expect(result).toBe('base included');
  });

  it('merges conflicting tailwind classes correctly', () => {
    const result = cn('px-4', 'px-8');
    expect(result).toBe('px-8'); // Later class wins
  });

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });
});
