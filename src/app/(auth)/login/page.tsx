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
    <>
      {/* Logo/Brand */}
      <div className="flex justify-center">
        <div className="bg-brand-primary-500 flex h-12 w-12 items-center justify-center rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground text-sm">Inicia sesión para continuar</p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Sign up link */}
      <p className="text-muted-foreground text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="text-brand-primary-500 hover:text-brand-primary-600 font-medium underline-offset-4 hover:underline"
        >
          Regístrate gratis
        </Link>
      </p>
    </>
  );
}
