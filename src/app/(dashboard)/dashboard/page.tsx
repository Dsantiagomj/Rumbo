import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { QuickActions } from './_components/quick-actions';

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
        <QuickActions />

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
