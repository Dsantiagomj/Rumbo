'use client';

/**
 * ImportWizard Component
 * Multi-step wizard for importing bank statements
 *
 * Flow:
 * Step 1: Confirm account details and balance
 * Step 2: Review suggested additional accounts
 * Step 3: Categorize transactions without clear categories
 * Step 4: Final review and summary
 *
 * Background: AI categorization runs during steps 1-3
 */
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';

// Import step components
import { AccountSelectionStep } from './wizard-steps/account-selection';
import { AccountConfirmationStep } from './wizard-steps/account-confirmation';
import { SuggestedAccountsStep } from './wizard-steps/suggested-accounts';
import { CategorizationStep } from './wizard-steps/categorization-step';
import { FinalReviewStep } from './wizard-steps/final-review';

export interface ParsedImportData {
  account: {
    bankName: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
    reportedBalance: number | null;
    accountNumber?: string;
  };
  transactions: Array<{
    date: Date;
    amount: number;
    description: string;
    rawDescription: string;
    type: 'EXPENSE' | 'INCOME';
  }>;
  confidence: number;
  importId: string;
}

export interface WizardData {
  // Account selection (from Step 1)
  selectedAccountId: string; // 'new' or existing account ID

  // Account info (from Step 2)
  accountName: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
  initialBalance: number;

  // Categorization data (managed throughout)
  transactionCategories: Map<number, string>; // index -> categoryId
  categoryConfidences: Map<number, number>; // index -> confidence

  // Additional transactions (from Step 3)
  additionalTransactions: ParsedImportData['transactions'];

  // AI categorization status
  isCategorizing: boolean;
  categorizationProgress: number; // 0-100
}

interface ImportWizardProps {
  importData: ParsedImportData;
}

const STEPS = [
  { id: 1, title: 'Seleccionar', description: 'Nueva o existente' },
  { id: 2, title: 'Confirmar', description: 'Detalles de cuenta' },
  { id: 3, title: 'Sugerencias', description: 'Cuentas adicionales' },
  { id: 4, title: 'Categorizar', description: 'Asigna categorías' },
  { id: 5, title: 'Revisar', description: 'Confirma todo' },
];

export function ImportWizard({ importData }: ImportWizardProps) {
  const categorizeMutation = trpc.import.categorize.useMutation();
  const hasStartedCategorization = useRef(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedAccountId: 'new',
    accountName: `${importData.account.bankName} - ${importData.account.accountType}`,
    accountType: importData.account.accountType,
    initialBalance: importData.account.reportedBalance || 0,
    transactionCategories: new Map(),
    categoryConfidences: new Map(),
    additionalTransactions: [],
    isCategorizing: true,
    categorizationProgress: 0,
  });

  // Start background AI categorization
  useEffect(() => {
    if (!hasStartedCategorization.current) {
      hasStartedCategorization.current = true;
      startBackgroundCategorization();
    }
  }, []);

  const startBackgroundCategorization = async () => {
    try {
      // Update progress to show we're starting
      setWizardData((prev) => ({ ...prev, categorizationProgress: 10 }));

      // Call AI categorization endpoint
      const results = await categorizeMutation.mutateAsync({
        transactions: importData.transactions.map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
        })),
      });

      // Update progress
      setWizardData((prev) => ({ ...prev, categorizationProgress: 50 }));

      // Map results to wizardData
      const categories = new Map<number, string>();
      const confidences = new Map<number, number>();

      results.forEach((result) => {
        if (result.categoryId) {
          categories.set(result.index, result.categoryId);
          confidences.set(result.index, result.confidence);
        }
      });

      // Complete categorization
      setWizardData((prev) => ({
        ...prev,
        transactionCategories: categories,
        categoryConfidences: confidences,
        categorizationProgress: 100,
        isCategorizing: false,
      }));
    } catch (error) {
      console.error('Error categorizing transactions:', error);
      // Still mark as complete even if categorization fails
      setWizardData((prev) => ({
        ...prev,
        isCategorizing: false,
        categorizationProgress: 100,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountSelectionStep
            importData={importData}
            onSelect={(accountId) => handleDataUpdate({ selectedAccountId: accountId })}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AccountConfirmationStep
            importData={importData}
            wizardData={wizardData}
            onDataUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <SuggestedAccountsStep importData={importData} onNext={handleNext} onBack={handleBack} />
        );
      case 4:
        return (
          <CategorizationStep
            importData={importData}
            wizardData={wizardData}
            onDataUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <FinalReviewStep
            importData={importData}
            wizardData={wizardData}
            onDataUpdate={handleDataUpdate}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? 'border-green-500 bg-green-500 text-white'
                        : currentStep === step.id
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-xs">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-colors ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* AI Categorization Progress */}
          {wizardData.isCategorizing && currentStep <= 3 && (
            <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-900">
                  Categorizando transacciones con IA...
                </p>
                <p className="text-sm text-purple-700">{wizardData.categorizationProgress}%</p>
              </div>
              <Progress value={wizardData.categorizationProgress} className="h-2" />
            </div>
          )}
        </div>
      </Card>

      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
}
