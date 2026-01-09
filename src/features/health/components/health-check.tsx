'use client';

import { trpc } from '@/shared/lib/trpc/client';
import { formatDateTime } from '@/shared/design-system/utils';

export function HealthCheck() {
  const { data, isLoading, error } = trpc.health.check.useQuery();

  if (isLoading) return <div>Checking health...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="border-border bg-background rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold">System Health Check</h3>
      <div className="mt-4 space-y-2">
        <p>
          <strong>Status:</strong>{' '}
          <span className="text-financial-positive">{data?.status?.toUpperCase()}</span>
        </p>
        <p>
          <strong>Version:</strong> {data?.version}
        </p>
        <p>
          <strong>Timestamp:</strong> {formatDateTime(data?.timestamp || new Date())}
        </p>
      </div>
    </div>
  );
}
