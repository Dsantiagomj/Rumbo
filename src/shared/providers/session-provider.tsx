'use client';

import { Suspense } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { Card } from '@/shared/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

function AuthLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-8 text-center">
        <Loader2 className="text-brand-primary-600 mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Cargando sesión...</p>
      </Card>
    </div>
  );
}

function AuthErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md p-8 text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Error de autenticación</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          No pudimos verificar tu sesión. Por favor intenta iniciar sesión nuevamente.
        </p>
        <Button onClick={() => (window.location.href = '/login')} className="w-full">
          Ir a Login
        </Button>
      </Card>
    </div>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<AuthErrorFallback />}>
      <Suspense fallback={<AuthLoadingFallback />}>
        <NextAuthSessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          {children}
        </NextAuthSessionProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
