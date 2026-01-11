'use client';

import { Upload, FileSpreadsheet, Brain, History, Zap } from 'lucide-react';
import { OptionCard } from './option-card';
import { uploadIconVariants } from './animations';
import type { Variants } from 'framer-motion';

interface ImportCardProps {
  onClick: () => void;
  variants?: Variants;
  prefersReducedMotion?: boolean;
}

export function ImportCard({ onClick, variants, prefersReducedMotion }: ImportCardProps) {
  return (
    <OptionCard
      theme={{
        primary: 'brand-primary-600',
        bg: 'blue-50',
        hover: 'blue-100',
      }}
      badge={{
        text: 'Recomendado',
        variant: 'default',
      }}
      icon={{
        component: Upload,
        variants: uploadIconVariants,
        color: 'brand-primary-600',
        bgColor: 'blue-100',
      }}
      title="Importar desde Archivo"
      timeEstimate="~5 min"
      description="Sube tu extracto o estado de cuenta en CSV o PDF. Detectaremos automáticamente tus transacciones y las categorizaremos con IA."
      features={[
        { icon: FileSpreadsheet, text: 'CSV y PDF soportados' },
        { icon: Brain, text: 'Categorización automática con IA' },
        { icon: History, text: 'Importa todo tu historial' },
        { icon: Zap, text: 'Detección automática de institución' },
      ]}
      bestFor={{
        icon: FileSpreadsheet,
        text: 'Mejor para: Productos con extracto o estado de cuenta digital',
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
