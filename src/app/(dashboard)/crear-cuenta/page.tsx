/**
 * Crear Cuenta Page
 * Two clear options: Import from file OR Create manually
 */
'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, FileText, PenTool, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { FileUploadZone } from '@/features/import/components/file-upload-zone';
import { ImportWizard } from '@/features/import/components/import-wizard';
import { CreateAccountDialog } from '@/features/accounts/components/create-account-dialog';

type CreationMethod = 'selection' | 'import' | 'manual';

interface ImportData {
  importId: string;
  account: {
    bankName: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
    suggestedName: string;
    reportedBalance?: number;
  };
  transactions: Array<{
    date: Date;
    amount: number;
    description: string;
    rawDescription: string;
    type: 'EXPENSE' | 'INCOME';
  }>;
  confidence: number;
}

export default function CrearCuentaPage() {
  const [method, setMethod] = useState<CreationMethod>('selection');
  const [importData, setImportData] = useState<ImportData | null>(null);

  const handleUploadSuccess = (data: ImportData) => {
    setImportData(data);
    setMethod('import');
  };

  const handleBackToSelection = () => {
    setMethod('selection');
    setImportData(null);
  };

  const handleManualCreated = () => {
    // Redirect to dashboard or accounts page
    window.location.href = '/dashboard';
  };

  // Selection screen - choose method
  if (method === 'selection') {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Elige cómo deseas agregar tu cuenta bancaria</p>
        </div>

        {/* Two Options - Side by Side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: Import from File */}
          <Card
            className="group cursor-pointer border-2 transition-all hover:border-blue-500 hover:shadow-lg"
            onClick={() => setMethod('import')}
          >
            <div className="p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 transition-colors group-hover:bg-blue-200">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">Importar Estado de Cuenta</h2>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Sube tu extracto bancario en formato CSV o PDF. Detectaremos automáticamente tus
                transacciones y te ayudaremos a categorizarlas.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span>Formatos CSV y PDF</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Detección automática de transacciones</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PenTool className="h-4 w-4 text-purple-600" />
                  <span>Categorización con IA</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Option 2: Manual Creation */}
          <Card
            className="group cursor-pointer border-2 transition-all hover:border-green-500 hover:shadow-lg"
            onClick={() => setMethod('manual')}
          >
            <div className="p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 transition-colors group-hover:bg-green-200">
                <PenTool className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">Crear Manualmente</h2>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Ingresa los datos de tu cuenta manualmente. Ideal para efectivo, cuentas sin estados
                de cuenta digitales, o si prefieres mayor control.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                  <span>Proceso rápido y simple</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                  <span>Control total sobre los datos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                  <span>Ideal para efectivo y otros</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            ¿No estás seguro cuál elegir?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Ver guía de ayuda
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Manual creation flow
  if (method === 'manual') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={handleBackToSelection}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a opciones
          </Button>

          <h1 className="text-3xl font-bold">Crear Cuenta Manualmente</h1>
          <p className="text-muted-foreground mt-2">Ingresa los detalles de tu cuenta bancaria</p>
        </div>

        {/* Manual Form */}
        <CreateAccountDialog onSuccess={handleManualCreated} />
      </div>
    );
  }

  // Import flow
  if (method === 'import' && !importData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={handleBackToSelection}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a opciones
          </Button>

          <h1 className="text-3xl font-bold">Importar Estado de Cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Sube tu estado de cuenta bancario en formato CSV o PDF
          </p>
        </div>

        {/* Upload Zone */}
        <FileUploadZone onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  }

  // Import wizard
  if (method === 'import' && importData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={handleBackToSelection}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar importación
          </Button>

          <h1 className="text-3xl font-bold">Completar Importación</h1>
          <p className="text-muted-foreground mt-2">Revisa y confirma los datos de tu cuenta</p>
        </div>

        {/* Wizard */}
        <ImportWizard
          importData={{
            importId: importData.importId,
            account: {
              bankName: importData.account.bankName,
              accountType: importData.account.accountType,
              reportedBalance: importData.account.reportedBalance ?? null,
              accountNumber: undefined,
            },
            transactions: importData.transactions,
            confidence: importData.confidence,
          }}
        />
      </div>
    );
  }

  return null;
}
