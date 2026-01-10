'use client';

/**
 * FileUploadZone Component
 * Drag & drop zone for CSV/PDF bank statements
 * Supports mobile camera capture
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { trpc } from '@/shared/lib/trpc/client';
import { cn } from '@/shared/lib/utils';
import { PDFPasswordDialog } from './pdf-password-dialog';

interface FileUploadZoneProps {
  onUploadSuccess: (data: {
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
  }) => void;
}

export function FileUploadZone({ onUploadSuccess }: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingPDFData, setPendingPDFData] = useState<{
    file: File;
    base64: string;
  } | null>(null);

  const parseCSV = trpc.import.parseCSV.useMutation();
  const parsePDF = trpc.import.parsePDF.useMutation();
  const { data: profile } = trpc.auth.getProfile.useQuery();

  // Helper function to process PDF with optional password
  const processPDF = useCallback(
    async (base64: string, fileName: string, password?: string) => {
      const { convertPDFToImages } = await import('@/features/import/utils/pdf-to-image');

      // Convert PDF to PNG images (with password if provided)
      const pngImages = await convertPDFToImages(base64, {
        scale: 2.0,
        maxPages: 10,
        password: password || profile?.identification || undefined,
      });

      if (pngImages.length === 0) {
        throw new Error('No se pudieron extraer páginas del PDF');
      }

      // Send first page as PNG to backend
      return await parsePDF.mutateAsync({
        fileName,
        fileContent: pngImages[0].imageData,
      });
    },
    [parsePDF, profile],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1];

          let result;
          if (file.name.endsWith('.csv')) {
            result = await parseCSV.mutateAsync({
              fileName: file.name,
              fileContent: base64,
            });
          } else if (file.name.endsWith('.pdf')) {
            try {
              // Try to process PDF with user's identification (if available)
              result = await processPDF(base64, file.name);
            } catch (err) {
              // Check if it's a password error
              const errorMessage = err instanceof Error ? err.message : '';
              if (errorMessage.includes('contraseña') || errorMessage.includes('password')) {
                // Store PDF data and show password dialog
                setPendingPDFData({ file, base64 });
                setShowPasswordDialog(true);
                setIsUploading(false);
                return;
              }
              // Re-throw other errors
              throw err;
            }
          }

          if (result) {
            onUploadSuccess(result);
          }
          setIsUploading(false);
        };

        reader.onerror = () => {
          setError('Error al leer el archivo');
          setIsUploading(false);
        };

        reader.readAsDataURL(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
        setIsUploading(false);
      }
    },
    [parseCSV, processPDF, onUploadSuccess],
  );

  // Handle password submission from dialog
  const handlePasswordSubmit = useCallback(
    async (password: string) => {
      if (!pendingPDFData) return;

      setIsUploading(true);
      setShowPasswordDialog(false);

      try {
        const result = await processPDF(pendingPDFData.base64, pendingPDFData.file.name, password);
        if (result) {
          onUploadSuccess(result);
        }
        setPendingPDFData(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al procesar el archivo';
        setError(errorMessage);
        // If password was wrong, show dialog again
        if (errorMessage.includes('contraseña') || errorMessage.includes('password')) {
          setShowPasswordDialog(true);
        } else {
          setPendingPDFData(null);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [pendingPDFData, processPDF, onUploadSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'cursor-pointer border-2 border-dashed p-12 text-center transition-colors',
          'pointer-coarse:p-16',
          isDragActive && 'border-brand-primary-500 bg-brand-primary-500/5',
          isUploading && 'cursor-not-allowed opacity-50',
        )}
      >
        <input {...getInputProps()} capture="environment" />

        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <Loader2 className="text-brand-primary-500 h-12 w-12 animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">Procesando archivo...</p>
                <p className="text-muted-foreground text-sm">Esto puede tomar unos segundos</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground h-12 w-12" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu estado de cuenta'}
                </p>
                <p className="text-muted-foreground text-sm">
                  o haz clic para seleccionar desde tu dispositivo
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV o PDF
                </div>
                <div className="text-muted-foreground">Máx. 10MB</div>
              </div>
            </>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/50 border-none p-6">
        <h3 className="mb-3 font-semibold">💡 Bancos soportados</h3>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>Bancolombia (CSV y PDF)</li>
          <li>Nequi (CSV)</li>
          <li>Davivienda (CSV y PDF)</li>
        </ul>
        <p className="text-muted-foreground mt-3 text-xs">
          Los archivos PDF protegidos usan generalmente tu cédula como contraseña
        </p>
      </Card>

      <PDFPasswordDialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setPendingPDFData(null);
            setIsUploading(false);
          }
        }}
        onPasswordSubmit={handlePasswordSubmit}
        isLoading={isUploading}
      />
    </div>
  );
}
