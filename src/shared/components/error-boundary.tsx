'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service (Sentry, etc.)
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // TODO: Send to Sentry when configured
    // captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="max-w-md p-8 text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">Algo salió mal</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Lo sentimos, ocurrió un error inesperado. Por favor intenta recargar la página.
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <div className="bg-muted mb-6 rounded-lg p-4 text-left">
            <p className="mb-2 text-xs font-semibold">Error Details (dev only):</p>
            <pre className="overflow-auto text-xs">{error.message}</pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onReset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1"
          >
            Ir al Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
