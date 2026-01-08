export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">
          Bienvenido a <span className="text-blue-600">Rumbo</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Tu asistente financiero personal impulsado por IA
        </p>
      </div>
    </main>
  );
}
