/**
 * Crear Cuenta Manual Page
 * Route: /crear-cuenta/manual
 */
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { CreateAccountDialog } from '@/features/accounts/components/create-account-dialog';
import { PageTransition } from '@/features/accounts/components/create-account/page-transition';

export default function ManualPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/crear-cuenta');
  };

  const handleManualCreated = () => {
    // Redirect to dashboard after successful creation
    router.push('/dashboard');
  };

  return (
    <PageTransition>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a opciones
          </Button>

          <h1 className="text-2xl font-bold md:text-3xl">Crear Cuenta Manualmente</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Ingresa los detalles de tu cuenta bancaria
          </p>
        </div>

        {/* Manual Form */}
        <CreateAccountDialog onSuccess={handleManualCreated} />
      </div>
    </PageTransition>
  );
}
