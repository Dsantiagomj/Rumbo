/**
 * Create Product Page
 * Selection view - choose between import or manual creation
 * Each option navigates to its own route for proper browser back button support
 */
'use client';

import { SelectionView } from '@/features/accounts/components/create-account/selection-view';
import { PageTransition } from '@/features/accounts/components/create-account/page-transition';

export default function NewProductPage() {
  return (
    <PageTransition>
      <SelectionView />
    </PageTransition>
  );
}
