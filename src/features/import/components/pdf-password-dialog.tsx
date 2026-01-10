'use client';

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
import { Lock } from 'lucide-react';

interface PDFPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordSubmit: (password: string) => void;
  isLoading?: boolean;
}

export function PDFPasswordDialog({
  open,
  onOpenChange,
  onPasswordSubmit,
  isLoading = false,
}: PDFPasswordDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <DialogTitle>PDF Protegido</DialogTitle>
          </div>
          <DialogDescription>
            Este archivo PDF está protegido con contraseña. Generalmente, los bancos usan tu número
            de cédula como contraseña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña del PDF</Label>
            <Input
              id="password"
              type="text"
              placeholder="Ingresa tu cédula o la contraseña del PDF"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
              maxLength={20}
            />
            <p className="text-muted-foreground text-xs">
              Ejemplo: 1140890261 (sin puntos ni espacios)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!password.trim() || isLoading}>
              {isLoading ? 'Procesando...' : 'Continuar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
