import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta | Rumbo',
  description: 'Crea tu cuenta en Rumbo y empieza a gestionar tus finanzas',
};

export default async function RegisterPage() {
  // Redirect to dashboard if already logged in
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm">
            Completa tus datos para empezar a usar Rumbo
          </p>
        </div>

        <RegisterForm />

        <p className="text-muted-foreground px-8 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-brand-primary-500 hover:text-brand-primary-600 underline underline-offset-4"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
