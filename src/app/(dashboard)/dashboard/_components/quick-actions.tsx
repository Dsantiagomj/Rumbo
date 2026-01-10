'use client';

import { QuickActionCard } from '@/shared/components/rumbo';
import { Settings, Plus, MessageSquare } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Acciones rápidas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          icon={Settings}
          label="Configurar perfil"
          onClick={() => (window.location.href = '/settings/profile')}
          variant="primary"
        />

        <QuickActionCard
          icon={Plus}
          label="Importar estado de cuenta"
          onClick={() => (window.location.href = '/import')}
          variant="default"
        />

        <QuickActionCard
          icon={MessageSquare}
          label="Chat con AI"
          variant="default"
          className="cursor-not-allowed opacity-50"
        />
      </div>
    </div>
  );
}
