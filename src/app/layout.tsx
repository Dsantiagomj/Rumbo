import type { Metadata } from 'next';
import './globals.css';
import 'react-day-picker/style.css';
import { TRPCProvider } from '@/shared/providers/trpc-provider';
import { SessionProvider } from '@/shared/providers/session-provider';

export const metadata: Metadata = {
  title: 'Rumbo - Tu Asistente Financiero Personal',
  description: 'Transforma el estrés financiero en claridad financiera',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <body>
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
