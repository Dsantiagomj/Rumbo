import { HealthCheck } from '@/features/health/components/health-check';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between">
        <h1 className="text-4xl font-bold">
          Bienvenido a <span className="text-blue-600">Rumbo</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Tu asistente financiero personal impulsado por IA
        </p>

        <div className="mt-8">
          <HealthCheck />
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Stack Info</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Next.js 16.0.10 + React 19.2.3</li>
            <li>✅ tRPC 11 + TanStack Query 5</li>
            <li>✅ Feature-based structure</li>
            <li>✅ End-to-end type safety</li>
            <li>✅ Prisma 7.2 + Neon PostgreSQL</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
