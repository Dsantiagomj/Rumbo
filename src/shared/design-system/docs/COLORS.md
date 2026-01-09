# Sistema de Colores

Paleta de colores completa del design system de Rumbo.

## 🎨 Paleta de Marca

### Primary (Blue)

**Uso:** Acciones principales, links, botones primarios, focus states

```tsx
<Button className="bg-brand-primary-500 hover:bg-brand-primary-600">Guardar</Button>
```

**Variantes:**

- `brand-primary-50` hasta `brand-primary-900`
- Principal: `brand-primary-500` (#3b82f6 aprox.)

### Secondary (Purple)

**Uso:** Features de AI, elementos innovadores, destacados secundarios

```tsx
<div className="bg-brand-secondary-500">AI Suggestion</div>
```

## 💰 Colores Financieros

### Positive (Green)

**Uso:** Ingresos, ahorros, balance positivo

```tsx
<p className="text-financial-positive">+{formatCurrency(100000)}</p>
```

### Negative (Red)

**Uso:** Gastos, deudas, balance negativo

```tsx
<p className="text-financial-negative">-{formatCurrency(50000)}</p>
```

### Warning (Amber)

**Uso:** Alertas de presupuesto, límites cercanos

```tsx
<Alert className="border-financial-warning">Alcanzaste el 80% de tu presupuesto</Alert>
```

## 🏷️ Colores de Categorías

Cada categoría tiene un color específico para reconocimiento visual rápido.

| Categoría     | Color   | Clase                         | Uso             |
| ------------- | ------- | ----------------------------- | --------------- |
| FOOD          | Orange  | `text-category-food`          | Alimentación    |
| TRANSPORT     | Blue    | `text-category-transport`     | Transporte      |
| BILLS         | Yellow  | `text-category-bills`         | Servicios       |
| ENTERTAINMENT | Purple  | `text-category-entertainment` | Entretenimiento |
| HEALTH        | Red     | `text-category-health`        | Salud           |
| EDUCATION     | Green   | `text-category-education`     | Educación       |
| PERSONAL      | Pink    | `text-category-personal`      | Personal        |
| DEBT          | Gray    | `text-category-debt`          | Deudas          |
| SAVINGS       | Emerald | `text-category-savings`       | Ahorro          |
| OTHER         | Slate   | `text-category-other`         | Otros           |

## 🌙 Dark Mode

Todos los colores se adaptan automáticamente al modo oscuro.

```tsx
<div className="bg-background text-foreground">Automáticamente se adapta light/dark</div>
```

## ✅ Accesibilidad

- **Contraste texto/fondo:** Mínimo 4.5:1 (WCAG AA)
- **Contraste UI elements:** Mínimo 3:1
- Todos los colores cumplen con WCAG 2.1 AA

## 🎨 Uso Avanzado

### Opacidad

```tsx
<div className="bg-brand-primary-500/10">10% opacity</div>
```

### Degradados

```tsx
<div className="from-brand-primary-500 to-brand-secondary-500 bg-gradient-to-r">Gradient</div>
```
