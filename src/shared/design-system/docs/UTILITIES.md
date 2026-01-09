# Utilidades

Funciones helper para formateo y manipulación de datos.

## 📦 Importación

```typescript
import {
  // Currency
  formatCurrency,
  formatCompactCurrency,
  parseCurrency,
  formatPercentage,

  // Date
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTransactionDate,

  // Number
  formatNumber,
  formatCompactNumber,

  // Utilities
  cn,
} from '@/shared/lib/utils';
```

## 💰 Currency

### formatCurrency

Formatea moneda en formato colombiano.

```typescript
formatCurrency(1234567.89); // "$1.234.567,89"
formatCurrency(1234.56, 'USD'); // "$1,234.56"
formatCurrency(1234.56, 'EUR'); // "€1.234,56"
```

### formatCompactCurrency

Formato compacto para gráficos y cards.

```typescript
formatCompactCurrency(1500000); // "$1,5 M"
formatCompactCurrency(50000); // "$50 mil"
```

### parseCurrency

Convierte string formateado a número.

```typescript
parseCurrency('$1.234.567,89'); // 1234567.89
```

### formatPercentage

```typescript
formatPercentage(0.15, 1, true); // "15,0%"
formatPercentage(85.5, 1); // "85,5%"
```

## 📅 Date

### formatDate

Formato colombiano DD/MM/YYYY.

```typescript
formatDate(new Date()); // "09/01/2026"
formatDate(new Date(), 'PPP'); // "9 de enero de 2026"
```

### formatDateTime

```typescript
formatDateTime(new Date()); // "09/01/2026 14:30"
```

### formatRelativeTime

```typescript
formatRelativeTime(new Date()); // "hace unos segundos"
formatRelativeTime(subMinutes(new Date(), 5)); // "hace 5 minutos"
```

### formatTransactionDate

Smart formatting para listas.

```typescript
formatTransactionDate(new Date()); // "Hoy"
formatTransactionDate(subDays(new Date(), 1)); // "Ayer"
formatTransactionDate(subDays(new Date(), 7)); // "02/01/2026"
```

## 🔢 Number

### formatNumber

```typescript
formatNumber(1234567); // "1.234.567"
formatNumber(1234.5678, 2); // "1.234,57"
```

### formatCompactNumber

```typescript
formatCompactNumber(1500000); // "1,5 M"
formatCompactNumber(50000); // "50 mil"
```

## 🎨 Utilities

### cn

Combina clases de Tailwind con precedencia correcta.

```typescript
cn('px-2 py-1', 'px-4'); // 'py-1 px-4' (px-4 wins)
cn('text-red-500', condition && 'text-blue-500'); // conditional
cn('base-classes', condition && 'conditional-classes', { 'class-name': booleanCondition });
```

## 💡 Ejemplos de Uso

### Transaction Display

```tsx
function TransactionItem({ tx }: { tx: Transaction }) {
  return (
    <div
      className={cn(
        'rounded p-4',
        tx.amount < 0 ? 'text-financial-negative' : 'text-financial-positive',
      )}
    >
      <p>{tx.description}</p>
      <p className="tabular-nums">
        {tx.amount < 0 ? '-' : '+'}
        {formatCurrency(Math.abs(tx.amount))}
      </p>
      <p className="text-muted-foreground text-sm">{formatTransactionDate(tx.date)}</p>
    </div>
  );
}
```

### Balance Card

```tsx
function BalanceCard({ balance, lastUpdate }: Props) {
  return (
    <Card>
      <h3>Balance Total</h3>
      <p className="text-4xl font-bold tabular-nums">{formatCurrency(balance)}</p>
      <p className="text-sm">Actualizado {formatRelativeTime(lastUpdate)}</p>
    </Card>
  );
}
```
