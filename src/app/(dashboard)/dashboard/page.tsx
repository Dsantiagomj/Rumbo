import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { QuickActions } from './_components/quick-actions';
import { AccountsList } from '@/features/accounts/components/accounts-list';

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

        {/* Bank Accounts */}
        <AccountsList />
      </div>
    </div>
  );
}
