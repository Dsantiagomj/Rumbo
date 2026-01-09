import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { Button } from '@/shared/components/ui/button';

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
            <Button asChild variant="outline" className="h-24">
              <Link href="/settings/profile">
                <div className="text-center">
                  <div className="mb-2 text-2xl">⚙️</div>
                  <div className="font-medium">Configurar perfil</div>
                </div>
              </Link>
            </Button>

            <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed">
              <span className="text-muted-foreground text-sm">
                Próximamente: Agregar transacción
              </span>
            </div>

            <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed">
              <span className="text-muted-foreground text-sm">Próximamente: Chat con AI</span>
            </div>
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
