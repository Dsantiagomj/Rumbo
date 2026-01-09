import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';

export default async function HomePage() {
  const session = await auth();

  // Redirect to dashboard if logged in, otherwise to login
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
