import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/shared/providers/trpc-provider';

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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
