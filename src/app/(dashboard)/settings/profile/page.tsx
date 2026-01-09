import { Metadata } from 'next';

import { ProfileForm } from '@/features/auth/components/profile-form';
import { LogoutButton } from '@/features/auth/components/logout-button';

export const metadata: Metadata = {
  title: 'Configuración de perfil | Rumbo',
  description: 'Configurá tu perfil y preferencias',
};

export default function ProfileSettingsPage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de perfil</h1>
          <p className="text-muted-foreground">Actualizá tu información personal y preferencias</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <ProfileForm />
        </div>

        <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-destructive text-lg font-semibold">Zona de peligro</h3>
              <p className="text-muted-foreground text-sm">
                Cerrá tu sesión si terminaste de usar la app
              </p>
            </div>
            <LogoutButton variant="destructive" />
          </div>
        </div>
      </div>
    </div>
  );
}
