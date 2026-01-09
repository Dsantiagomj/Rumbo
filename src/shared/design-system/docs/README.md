# Rumbo Design System

Design system multi-plataforma para Rumbo - AI-Powered Life Assistant

## 🎯 Filosofía

- **Mobile-First:** Diseñado para móvil, mejorado para desktop
- **Consistencia:** Mismo look & feel en web, PWA y mobile (futuro)
- **Accesibilidad:** WCAG 2.1 AA compliance
- **Performance:** Optimizado para carga rápida
- **Contexto Colombiano:** COP, es-CO, categorías locales

## 📚 Estructura

```
design-system/
├── tokens/           # Design tokens (colors, typography, spacing, shadows)
├── utils/            # Utilidades (formatCurrency, formatDate, etc.)
├── docs/             # Esta documentación
└── tokens-native.ts  # Tokens para React Native (v4+)
```

## 🚀 Quick Start

### Importar Utilidades

```typescript
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';

// Formatear moneda
formatCurrency(1234567.89); // "$1.234.567,89"

// Formatear fecha
formatDate(new Date()); // "09/01/2026"

// Combinar clases
cn('text-red-500', condition && 'text-blue-500');
```

### Usar Colores

```tsx
// Brand colors
<div className="bg-brand-primary-500 text-white">
  Primary Action
</div>

// Financial colors
<p className="text-financial-positive">+$100.000</p>
<p className="text-financial-negative">-$50.000</p>

// Category colors
<div className="text-category-food">Alimentación</div>
```

### Usar Componentes Rumbo

```tsx
import {
  TransactionCard,
  BalanceDisplay,
  CategoryIcon,
  StatCard,
  QuickActionCard,
} from '@/shared/components/rumbo';

// Transaction Card
<TransactionCard
  amount={-50000}
  description="Almuerzo"
  category="FOOD"
  date={new Date()}
  onEdit={(id) => console.log('edit', id)}
  onDelete={(id) => console.log('delete', id)}
/>

// Balance Display
<BalanceDisplay
  total={1234567.89}
  accounts={3}
  lastUpdated={new Date()}
/>

// Category Icon
<CategoryIcon category="FOOD" size="md" showLabel />

// Stat Card
<StatCard
  label="Gastos este mes"
  value={450000}
  change={-15}
  format="currency"
/>

// Quick Action
<QuickActionCard
  icon={Plus}
  label="Nueva transacción"
  onClick={() => navigate('/new')}
/>
```

## 🎨 Paleta de Colores

### Brand Colors

- **Primary Blue:** Acciones principales, links, focus states
  - `bg-brand-primary-500`, `text-brand-primary-600`
- **Secondary Purple:** AI features, innovación
  - `bg-brand-secondary-500`

### Financial Colors

- **Positive Green:** Ingresos, ahorros
  - `text-financial-positive`
- **Negative Red:** Gastos, deudas
  - `text-financial-negative`
- **Neutral Gray:** Transferencias neutras
  - `text-financial-neutral`
- **Warning Amber:** Alertas, límites de presupuesto
  - `text-financial-warning`

### Category Colors

Cada categoría tiene un color distintivo:

- FOOD: Orange
- TRANSPORT: Blue
- BILLS: Yellow
- ENTERTAINMENT: Purple
- HEALTH: Red
- EDUCATION: Green
- PERSONAL: Pink
- DEBT: Gray
- SAVINGS: Emerald
- OTHER: Slate

## 📐 Spacing & Layout

### Touch Targets

Mínimo 44px × 44px para elementos táctiles:

```tsx
<Button className="h-11">
  {' '}
  {/* 44px */}
  Touch Friendly
</Button>
```

### Responsive Breakpoints

```typescript
xs: 320px   // Móviles pequeños
sm: 640px   // Móviles grandes
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

### Uso con pointer-coarse

Para dispositivos táctiles, aumenta spacing automáticamente:

```tsx
<div className="p-4 pointer-coarse:p-6">Más padding en pantallas táctiles</div>
```

## 🔤 Tipografía

### Font Family

- **Sans:** Inter (optimizado para pantallas, números tabular)
- **Mono:** System monospace

### Números Tabular

Para alinear números (crucial para finanzas):

```tsx
<span className="tabular-nums">$1.234.567,89</span>
```

### Tamaños

```tsx
text-xs    // 12px - Labels
text-sm    // 14px - Secondary text
text-base  // 16px - Body
text-lg    // 18px - Subheadings
text-xl    // 20px - Card titles
text-2xl   // 24px - Section headings
text-3xl   // 30px - Page headings
text-4xl   // 36px - Balance display
```

## 📱 Plataformas Soportadas

- ✅ **Web** (Next.js + Tailwind CSS 4.0)
- ✅ **PWA** (instalable desktop/mobile)
- ⏳ **Mobile** (Expo + React Native Reusables - v4)

## 📖 Documentación Completa

- [Colores](./COLORS.md) - Paleta completa y uso
- [Tipografía](./TYPOGRAPHY.md) - Sistema de tipografía
- [Componentes](./COMPONENTS.md) - Guía de componentes
- [Utilidades](./UTILITIES.md) - Funciones helper

## 🔗 Recursos Externos

- [Tailwind CSS 4.0 Docs](https://tailwindcss.com)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [React Native Reusables](https://reactnativereusables.com) (futuro)
- [Lucide Icons](https://lucide.dev)

## 🛠️ Mantenimiento

**Actualizado:** 2026-01-09
**Versión:** 1.0.0
**Mantenedor:** Rumbo Team

---

¿Dudas? Consulta la documentación específica o abre un issue en GitHub.
