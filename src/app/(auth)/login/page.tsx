import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/shared/lib/auth';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión | Rumbo',
  description: 'Iniciá sesión en tu cuenta de Rumbo',
};

export default async function LoginPage() {
  // Redirect to dashboard if already logged in
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground text-sm">Inicia sesión en tu cuenta</p>
        </div>

        <LoginForm />

        <p className="text-muted-foreground px-8 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="hover:text-brand underline underline-offset-4">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
