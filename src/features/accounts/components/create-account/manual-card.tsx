'use client';

import { PenTool, Zap, Sliders, Wallet, Lock } from 'lucide-react';
import { OptionCard } from './option-card';
import { penIconVariants } from './animations';
import type { Variants } from 'framer-motion';

interface ManualCardProps {
  onClick: () => void;
  variants?: Variants;
  prefersReducedMotion?: boolean;
}

export function ManualCard({ onClick, variants, prefersReducedMotion }: ManualCardProps) {
  return (
    <OptionCard
      theme={{
        primary: 'financial-positive',
        bg: 'green-50',
        hover: 'green-100',
      }}
      badge={{
        text: 'Rápido',
        variant: 'secondary',
      }}
      icon={{
        component: PenTool,
        variants: penIconVariants,
        color: 'financial-positive',
        bgColor: 'green-100',
      }}
      title="Crear Manualmente"
      timeEstimate="~2 min"
      description="Ingresa los datos básicos de tu cuenta. Perfecto para efectivo, cuentas sin extracto digital, o si prefieres control total."
      features={[
        { icon: Zap, text: 'Configuración en minutos' },
        { icon: Sliders, text: 'Control total de los datos' },
        { icon: Wallet, text: 'Ideal para efectivo' },
        { icon: Lock, text: 'Sin necesidad de archivos' },
      ]}
      bestFor={{
        icon: Wallet,
        text: 'Mejor para: Efectivo, Nequi, o cuentas sin extracto',
      }}
      stats={{
        show: false,
        text: '',
      }}
      onClick={onClick}
      variants={variants}
      prefersReducedMotion={prefersReducedMotion}
    />
  );
}
