'use client';

/**
 * ManualTransactionForm Component
 * Allows users to manually add transactions during import review
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { CalendarIcon, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ManualTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    date: Date;
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
  }) => void;
}

export function ManualTransactionForm({ isOpen, onClose, onAdd }: ManualTransactionFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum === 0) {
      setError('El monto debe ser un número válido mayor a 0');
      return;
    }

    // Add transaction
    onAdd({
      date,
      description: description.trim(),
      amount: type === 'EXPENSE' ? -Math.abs(amountNum) : Math.abs(amountNum),
      type,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setType('EXPENSE');
    setDate(new Date());
    onClose();
  };

  const handleCancel = () => {
    setError(null);
    setDescription('');
    setAmount('');
    setType('EXPENSE');
    setDate(new Date());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar transacción manual
          </DialogTitle>
          <DialogDescription>
            Ingresa los detalles de la transacción que deseas agregar manualmente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de transacción *</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'EXPENSE' | 'INCOME')}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
                <SelectItem value="INCOME">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Compra en supermercado"
              autoComplete="off"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                autoComplete="off"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Ingresa el monto sin signo (se ajustará automáticamente según el tipo)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {description && amount && !isNaN(parseFloat(amount)) && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-semibold">Vista previa:</div>
                  <div className="flex justify-between text-sm">
                    <span>{description}</span>
                    <span className={type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                      {type === 'INCOME' ? '+' : '-'}$
                      {Math.abs(parseFloat(amount)).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {format(date, 'PPP', { locale: es })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Agregar transacción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
