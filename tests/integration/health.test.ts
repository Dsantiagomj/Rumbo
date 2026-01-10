import { describe, it, expect } from 'vitest';
import { appRouter } from '@/shared/lib/trpc/root';
import { db } from '@/shared/lib/db';

describe('Health Router', () => {
  it('returns health check status', async () => {
    const caller = appRouter.createCaller({ session: null, db });
    const result = await caller.health.check();

    expect(result).toMatchObject({
      status: 'ok',
      version: '1.0.0',
    });
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('echoes message back', async () => {
    const caller = appRouter.createCaller({ session: null, db });
    const result = await caller.health.echo({ message: 'Hello' });

    expect(result.message).toBe('Hello');
    expect(result.echo).toBe('You said: Hello');
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('validates echo input', async () => {
    const caller = appRouter.createCaller({ session: null, db });

    await expect(() => caller.health.echo({ message: '' })).rejects.toThrow();
  });
});
