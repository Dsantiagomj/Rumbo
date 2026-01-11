'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { ImportCard } from './import-card';
import { ManualCard } from './manual-card';
import { HelpSection } from './help-section';
import { containerVariants, cardVariants, cardVariantsReduced, headerVariants } from './animations';
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion';

export function SelectionView() {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeVariants = prefersReducedMotion ? cardVariantsReduced : cardVariants;

  const handleImportClick = () => {
    router.push('/products/new/import');
  };

  const handleManualClick = () => {
    router.push('/products/new/manual');
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header with Animation */}
      <motion.div className="mb-8" variants={headerVariants} initial="hidden" animate="visible">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>

        <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">Agregar Producto Financiero</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Elige cómo deseas agregar tu cuenta, tarjeta de crédito, préstamo o inversión
        </p>
      </motion.div>

      {/* Cards Grid with Stagger Animation */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ImportCard
          onClick={handleImportClick}
          variants={activeVariants}
          prefersReducedMotion={prefersReducedMotion}
        />
        <ManualCard
          onClick={handleManualClick}
          variants={activeVariants}
          prefersReducedMotion={prefersReducedMotion}
        />
      </motion.div>

      {/* Help Section */}
      <HelpSection />
    </div>
  );
}
