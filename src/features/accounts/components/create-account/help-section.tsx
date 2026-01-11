'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ComparisonTable } from './comparison-table';
import { helpSectionVariants } from './animations';
import { cn } from '@/shared/lib/utils';

export function HelpSection() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="mt-8">
      {/* Toggle Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => setShowComparison(!showComparison)}
          className="text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          ¿No estás seguro cuál elegir?
          <ChevronDown
            className={cn(
              'ml-2 h-4 w-4 transition-transform duration-300',
              showComparison && 'rotate-180',
            )}
          />
        </Button>
      </div>

      {/* Expandable Comparison Table */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            variants={helpSectionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            style={{ overflow: 'hidden' }}
          >
            <ComparisonTable />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
