import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { QuickActionCard } from '@/shared/components/rumbo';
import { Settings, Plus, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Rumbo',
  description: 'Tu centro de control financiero',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <div className="container max-w-6xl py-10">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">¡Hola {user.preferredName}! 👋</h1>
          <p className="text-muted-foreground mt-2 text-lg">Bienvenido a tu dashboard financiero</p>
        </div>

        {/* Quick Actions */}
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
              label="Agregar transacción"
              variant="default"
              className="cursor-not-allowed opacity-50"
            />

            <QuickActionCard
              icon={MessageSquare}
              label="Chat con AI"
              variant="default"
              className="cursor-not-allowed opacity-50"
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-muted/50 rounded-lg border p-6">
          <h3 className="mb-2 text-lg font-semibold">🎉 ¡Tu cuenta está configurada!</h3>
          <p className="text-muted-foreground text-sm">
            Ya podés empezar a usar Rumbo. Próximamente vas a poder importar tus transacciones,
            chatear con la AI y mucho más.
          </p>
          <div className="mt-4 text-sm">
            <p>
              <strong>Tu perfil:</strong>
            </p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
              <li>Nombre: {user.name}</li>
              <li>Email: {user.email}</li>
              <li>Rol: {user.role}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
