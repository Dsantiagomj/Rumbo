import { ReactNode } from 'react';

import { AuthPanel } from '@/features/auth/components/auth-panel';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left: Form Content (always visible) */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 md:px-8">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>

      {/* Right: Auth Panel (hidden on mobile, visible 768px+) */}
      <AuthPanel />
    </div>
  );
}
