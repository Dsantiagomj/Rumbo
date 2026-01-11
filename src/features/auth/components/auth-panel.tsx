export function AuthPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-neutral-900 md:block">
      {/* Gradient Overlay */}
      <div className="from-brand-primary-600 via-brand-primary-500 to-brand-accent-500 absolute inset-0 bg-gradient-to-br opacity-90" />

      {/* Pattern Overlay (optional decorative grid) */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative flex h-full items-center justify-center p-12">
        <div className="max-w-md space-y-6 text-center">
          {/* Logo/Icon (placeholder for now) */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-white">Tu rumbo financiero comienza aquí</h2>

          {/* Subheadline */}
          <p className="text-lg text-white/80">
            Transforma el estrés financiero en claridad con ayuda de IA. Hecho para Colombia,
            pensando en vos.
          </p>

          {/* Features list (optional) */}
          <div className="space-y-3 pt-6 text-left">
            {[
              'Seguimiento automático de gastos',
              'Presupuestos inteligentes',
              'Asistente IA personalizado',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
