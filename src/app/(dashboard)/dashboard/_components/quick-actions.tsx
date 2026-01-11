'use client';

import { useRouter } from 'next/navigation';
import { QuickActionCard } from '@/shared/components/rumbo';
import { Settings, Plus, MessageSquare } from 'lucide-react';
import { navigate } from '@/shared/lib/navigation';

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Acciones rápidas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          icon={Settings}
          label="Configurar perfil"
          onClick={() => navigate('/settings/profile')}
          variant="primary"
        />

        <QuickActionCard
          icon={Plus}
          label="Crear cuenta"
          onClick={() => navigate('/products/new', router)}
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
