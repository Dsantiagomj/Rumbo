/**
 * Importar Estado de Cuenta Page
 * Route: /crear-cuenta/importar
 */
'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { FileUploadZone } from '@/features/import/components/file-upload-zone';
import { ImportWizard } from '@/features/import/components/import-wizard';
import { PageTransition } from '@/features/accounts/components/create-account/page-transition';

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

export default function ImportarPage() {
  const router = useRouter();
  const [importData, setImportData] = useState<ImportData | null>(null);

  const handleUploadSuccess = (data: ImportData) => {
    setImportData(data);
  };

  const handleBack = () => {
    router.push('/crear-cuenta');
  };

  return (
    <PageTransition key={importData ? 'wizard' : 'upload'}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a opciones
          </Button>

          <h1 className="text-2xl font-bold md:text-3xl">
            {importData ? 'Completar Importación' : 'Importar Estado de Cuenta'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {importData
              ? 'Revisa y confirma los datos de tu cuenta'
              : 'Sube tu estado de cuenta bancario en formato CSV o PDF'}
          </p>
        </div>

        {/* Content */}
        {!importData ? (
          <FileUploadZone onUploadSuccess={handleUploadSuccess} />
        ) : (
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
        )}
      </div>
    </PageTransition>
  );
}
