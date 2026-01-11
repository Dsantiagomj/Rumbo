'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Products error:', error);
    // TODO: captureException(error, { tags: { section: 'products' } });
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="max-w-md p-8 text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">Error al crear producto</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          No pudimos procesar tu solicitud. Por favor intenta de nuevo o vuelve al dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted mb-6 rounded-lg p-4 text-left">
            <p className="mb-2 text-xs font-semibold">Error Details (dev only):</p>
            <pre className="overflow-auto text-xs">{error.message}</pre>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
