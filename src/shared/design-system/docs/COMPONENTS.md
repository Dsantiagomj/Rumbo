# Componentes Rumbo

Guía de uso de componentes específicos de Rumbo.

## 📦 Importación

```typescript
import {
  TransactionCard,
  BalanceDisplay,
  CategoryIcon,
  StatCard,
  QuickActionCard,
} from '@/shared/components/rumbo';
```

## 💳 TransactionCard

Muestra información de transacción con acciones opcionales.

### Props

| Prop        | Type           | Default  | Descripción              |
| ----------- | -------------- | -------- | ------------------------ |
| id          | string         | -        | ID único (opcional)      |
| amount      | number         | required | Monto (negativo = gasto) |
| description | string         | required | Descripción              |
| category    | CategoryKey    | required | Categoría                |
| date        | Date \| string | required | Fecha                    |
| onEdit      | (id) => void   | -        | Callback editar          |
| onDelete    | (id) => void   | -        | Callback eliminar        |

### Ejemplo

```tsx
<TransactionCard
  id="tx-123"
  amount={-50000}
  description="Almuerzo La Puerta Falsa"
  category="FOOD"
  date={new Date()}
  onEdit={(id) => router.push(`/edit/${id}`)}
  onDelete={(id) => handleDelete(id)}
/>
```

## 💰 BalanceDisplay

Muestra balance total con metadata.

### Props

| Prop        | Type                    | Default    | Descripción          |
| ----------- | ----------------------- | ---------- | -------------------- |
| total       | number                  | required   | Balance total        |
| accounts    | number                  | -          | Número de cuentas    |
| lastUpdated | Date \| string          | -          | Última actualización |
| variant     | 'default' \| 'gradient' | 'gradient' | Estilo               |

### Ejemplo

```tsx
<BalanceDisplay total={1234567.89} accounts={3} lastUpdated={new Date()} variant="gradient" />
```

## 🏷️ CategoryIcon

Icono de categoría con colores consistentes.

### Props

| Prop      | Type                 | Default  | Descripción   |
| --------- | -------------------- | -------- | ------------- |
| category  | CategoryKey          | required | Categoría     |
| size      | 'sm' \| 'md' \| 'lg' | 'md'     | Tamaño        |
| showLabel | boolean              | false    | Mostrar label |

### Ejemplo

```tsx
<CategoryIcon category="FOOD" size="md" showLabel />
```

### Helpers

```typescript
// Obtener label
getCategoryLabel('FOOD'); // "Alimentación"

// Obtener todas las categorías
const categories = getAllCategories();
// [{ key: 'FOOD', label: 'Alimentación', icon: ShoppingCart }, ...]
```

## 📊 StatCard

Muestra estadística con valor y cambio opcional.

### Ejemplo

```tsx
<StatCard
  label="Gastos este mes"
  value={450000}
  format="currency"
  change={-15}
  icon={TrendingDown}
/>
```

## ⚡ QuickActionCard

Botón de acción rápida touch-friendly.

### Ejemplo

```tsx
<QuickActionCard
  icon={Plus}
  label="Nueva transacción"
  onClick={() => router.push('/new')}
  variant="primary"
/>
```

## 🎨 Personalización

Todos los componentes aceptan `className` para personalización:

```tsx
<TransactionCard {...props} className="border-brand-primary-500 border-2" />
```
