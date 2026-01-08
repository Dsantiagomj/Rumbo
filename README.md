# Rumbo 🧭

> Tu asistente financiero personal impulsado por IA para Colombia

Transforma el estrés financiero en claridad financiera mediante aprendizaje de patrones, predicción de necesidades, y recomendaciones accionables.

---

## 🎯 Sobre Rumbo

Rumbo es un asistente de vida impulsado por IA que ayuda a navegar tu viaje financiero y metas de vida con guía inteligente. Diseñado específicamente para el contexto colombiano (COP, español colombiano, tiendas locales).

**Versión Actual:** v1 Skateboard (Foundation - Personal Finance Tool)

Para más información sobre el proyecto, visita `.rumbo/README.md`

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0.10+ (App Router, React 19.2.3+)
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4.1 (CSS-based config)
- **Database:** PostgreSQL 16+ (Neon - serverless)
- **ORM:** Prisma 7.2+ (Rust-free, ES Modules)
- **Auth:** NextAuth.js 5 + Argon2
- **AI:** OpenAI API (GPT-4 Turbo)
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

Ver stack completo en `.claude/RULEBOOK.md`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 LTS
- pnpm 9+
- PostgreSQL (Neon recommended)
- OpenAI API key

### Setup

1. **Clone & Install**

```bash
git clone https://github.com/Dsantiagomj/Rumbo.git
cd rumbo
pnpm install
```

2. **Setup Database (Neon)**

```bash
# Initialize Neon CLI and create database
npx neonctl@latest init

# Copy environment variables
cp .env.example .env.local

# Update DATABASE_URL in .env.local with your Neon connection string
```

3. **Configure Environment**

Edit `.env.local` with your credentials:

```env
DATABASE_URL="postgresql://..." # From Neon
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
OPENAI_API_KEY="sk-proj-..." # From OpenAI
```

4. **Setup Prisma**

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# (Optional) Open Prisma Studio
pnpm prisma studio
```

5. **Run Development Server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
rumbo/
├── .claude/              # Claude Code config & RULEBOOK
├── .rumbo/               # Project documentation
├── prisma/               # Database schema & migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth routes
│   │   ├── (dashboard)/  # Dashboard routes
│   │   └── api/          # API routes (minimal)
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn components
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── bills/
│   │   └── ai-chat/
│   ├── lib/              # Utilities & config
│   ├── actions/          # Server Actions
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
└── tests/                # Unit, integration & E2E tests
```

---

## 🧪 Development

### Available Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality
pnpm lint                 # Run ESLint
pnpm format               # Format with Prettier
pnpm format:check         # Check formatting
pnpm type-check           # TypeScript check
pnpm check                # Run all checks

# Database
pnpm prisma generate      # Generate Prisma client
pnpm prisma migrate dev   # Run migrations (dev)
pnpm prisma studio        # Open Prisma Studio

# Testing
pnpm test                 # Run tests (TBD)
pnpm test:e2e             # Run E2E tests (TBD)
```

### Git Hooks

- **pre-commit:** Runs lint-staged (prettier + eslint on changed files)
- **pre-push:** Runs tests (when configured)

---

## 🔒 Security

This project uses **patched versions** to protect against critical vulnerabilities:

- ✅ CVE-2025-55182 (React2Shell RCE - CVSS 10.0)
- ✅ CVE-2025-55184 (DoS - CVSS 7.5)
- ✅ CVE-2025-55183 (Source Code Exposure - CVSS 5.3)
- ✅ CVE-2025-67779 (Complete DoS fix)

**Current versions:**

- Next.js 16.0.10+ (security patches included)
- React 19.2.3+ (security patches included)

---

## 🌍 Colombian Context

- **Currency:** COP (Colombian Peso)
- **Language:** Spanish (es-CO) - Colombian Spanish
- **Format:** 1.234.567,89 (period for thousands, comma for decimals)
- **Timezone:** America/Bogota (UTC-5)
- **Target Cities:** Bogotá, Medellín, Cali

---

## 📚 Documentation

- **Project Vision:** `.rumbo/PROJECT_DEFINITION.md`
- **Roadmap:** `.rumbo/SCOPE.md`
- **Features Backlog:** `.rumbo/FEATURES_BACKLOG.md`
- **Tech Stack:** `.rumbo/TECH_STACK.md`
- **RULEBOOK:** `.claude/RULEBOOK.md` (development patterns)

---

## 🤝 Contributing

This is currently a personal project (Phase 0 - Personal Use). Contributions are not yet open, but feedback is welcome!

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Daniel Santiago**

- GitHub: [@Dsantiagomj](https://github.com/Dsantiagomj)

---

**Built with ❤️ in Colombia 🇨🇴**
