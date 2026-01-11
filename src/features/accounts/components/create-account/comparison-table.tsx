'use client';

import { Upload, PenTool, Info } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export function ComparisonTable() {
  return (
    <Card className="mt-4 p-6">
      {/* Recommendation Box - FIRST */}
      <Alert className="border-brand-primary-600 [&>svg]:text-brand-primary-600 mb-6 bg-blue-50">
        <Info className="h-5 w-5" />
        <AlertDescription>
          <p className="text-brand-primary-600 font-medium">Recomendación</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Si tienes un extracto o estado de cuenta digital, usa <strong>Importar</strong> para
            obtener todo tu historial automáticamente. Si necesitas registrar efectivo o un producto
            simple, <strong>Manual</strong> es más rápido.
          </p>
        </AlertDescription>
      </Alert>

      {/* Title */}
      <h3 className="mb-4 text-lg font-semibold">Comparación detallada</h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left text-sm font-medium">Característica</th>
              <th className="py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Upload className="text-brand-primary-600 h-5 w-5" />
                  <span className="text-xs font-medium">Importar (~5 min)</span>
                </div>
              </th>
              <th className="py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <PenTool className="text-financial-positive h-5 w-5" />
                  <span className="text-xs font-medium">Manual (~2 min)</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 text-sm">Historial de transacciones</td>
              <td className="text-center text-sm">
                <span className="font-medium">Sí</span>
                <div className="text-muted-foreground text-xs">Completo</div>
              </td>
              <td className="text-center text-sm">
                <span className="font-medium">No</span>
                <div className="text-muted-foreground text-xs">Sin historial</div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-3 text-sm">Categorización automática</td>
              <td className="text-center text-sm">
                <span className="font-medium">Sí</span>
                <div className="text-muted-foreground text-xs">Con IA</div>
              </td>
              <td className="text-center text-sm">
                <span className="font-medium">Manual</span>
                <div className="text-muted-foreground text-xs">Tú decides</div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-3 text-sm">Requiere archivo</td>
              <td className="text-center text-sm">
                <span className="font-medium">Sí</span>
                <div className="text-muted-foreground text-xs">CSV o PDF</div>
              </td>
              <td className="text-center text-sm">
                <span className="font-medium">No</span>
                <div className="text-muted-foreground text-xs">Solo datos básicos</div>
              </td>
            </tr>

            <tr>
              <td className="py-3 text-sm">Ideal para</td>
              <td className="text-center text-xs">
                <div className="text-muted-foreground">Bancos tradicionales</div>
                <div className="text-muted-foreground">con extracto digital</div>
              </td>
              <td className="text-center text-xs">
                <div className="text-muted-foreground">Efectivo, Nequi,</div>
                <div className="text-muted-foreground">Daviplata</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
