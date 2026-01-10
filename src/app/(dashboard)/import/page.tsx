/**
 * Import Page
 * Main page for importing bank statements (CSV/PDF)
 * Flow: Upload → Review → Confirm → Redirect to Dashboard
 */
'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { FileUploadZone } from '@/features/import/components/file-upload-zone';
import { AccountReview } from '@/features/import/components/account-review';
import { AccountSelector } from '@/features/import/components/account-selector';

type ImportStep = 'upload' | 'select-account' | 'review';

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

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('new');

  const handleUploadSuccess = (data: ImportData) => {
    setImportData(data);
    setCurrentStep('select-account');
  };

  const handleAccountSelected = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentStep('review');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setImportData(null);
    setSelectedAccountId('new');
  };

  const handleBackToAccountSelect = () => {
    setCurrentStep('select-account');
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Importar Estado de Cuenta</h1>
        <p className="text-muted-foreground mt-2">
          {currentStep === 'upload' && 'Sube tu estado de cuenta bancario en formato CSV o PDF'}
          {currentStep === 'select-account' && 'Selecciona dónde deseas importar las transacciones'}
          {currentStep === 'review' && 'Revisa y confirma los datos importados'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {/* Step 1: Upload */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              currentStep === 'upload'
                ? 'bg-brand-primary-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {currentStep === 'upload' ? '1' : '✓'}
          </div>
          <span className={currentStep === 'upload' ? 'font-medium' : 'text-sm'}>Cargar</span>
        </div>

        <div className="bg-muted mx-2 h-0.5 w-12" />

        {/* Step 2: Select Account */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              currentStep === 'select-account'
                ? 'bg-brand-primary-500 text-white'
                : currentStep === 'review'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {currentStep === 'review' ? '✓' : '2'}
          </div>
          <span
            className={
              currentStep === 'select-account'
                ? 'font-medium'
                : currentStep === 'review'
                  ? 'text-sm'
                  : 'text-muted-foreground text-sm'
            }
          >
            Seleccionar
          </span>
        </div>

        <div className="bg-muted mx-2 h-0.5 w-12" />

        {/* Step 3: Review */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              currentStep === 'review'
                ? 'bg-brand-primary-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
          <span
            className={currentStep === 'review' ? 'font-medium' : 'text-muted-foreground text-sm'}
          >
            Confirmar
          </span>
        </div>
      </div>

      {/* Content */}
      {currentStep === 'upload' && <FileUploadZone onUploadSuccess={handleUploadSuccess} />}

      {currentStep === 'select-account' && importData && (
        <div className="space-y-6">
          <AccountSelector
            bankName={importData.account.bankName}
            onSelect={handleAccountSelected}
            value={selectedAccountId}
          />

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBackToUpload} className="flex-1">
              Volver
            </Button>
            <Button onClick={() => handleAccountSelected(selectedAccountId)} className="flex-1">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'review' && importData && (
        <AccountReview importData={importData} selectedAccountId={selectedAccountId} />
      )}

      {/* Back button for review step */}
      {currentStep === 'review' && (
        <div className="mt-6">
          <Button variant="ghost" onClick={handleBackToAccountSelect} className="w-full">
            Cambiar cuenta
          </Button>
        </div>
      )}
    </div>
  );
}
