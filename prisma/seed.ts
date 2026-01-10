import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create PostgreSQL Pool for seeding (works with Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const defaultCategories = [
  // INCOME CATEGORIES
  {
    key: 'SALARY',
    name: 'Salario',
    icon: 'Briefcase',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'FREELANCE',
    name: 'Trabajo Independiente',
    icon: 'Laptop',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'INVESTMENT_INCOME',
    name: 'Rendimientos',
    icon: 'TrendingUp',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'OTHER_INCOME',
    name: 'Otros Ingresos',
    icon: 'Plus',
    color: 'financial-positive',
    type: 'INCOME',
  },

  // FOOD
  {
    key: 'FOOD',
    name: 'Comida',
    icon: 'UtensilsCrossed',
    color: 'category-food',
    type: 'EXPENSE',
  },

  // TRANSPORTATION
  {
    key: 'TRANSPORT',
    name: 'Transporte',
    icon: 'Car',
    color: 'category-transport',
    type: 'EXPENSE',
  },

  // HOUSING & BILLS
  {
    key: 'HOUSING',
    name: 'Vivienda',
    icon: 'Home',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'UTILITIES',
    name: 'Servicios Públicos',
    icon: 'Lightbulb',
    color: 'category-bills',
    type: 'EXPENSE',
  },

  // SHOPPING
  {
    key: 'SHOPPING',
    name: 'Compras',
    icon: 'ShoppingBag',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // ENTERTAINMENT
  {
    key: 'ENTERTAINMENT',
    name: 'Entretenimiento',
    icon: 'Film',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'TRAVEL',
    name: 'Viajes',
    icon: 'Plane',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },

  // HEALTH
  {
    key: 'HEALTH',
    name: 'Salud',
    icon: 'Heart',
    color: 'category-health',
    type: 'EXPENSE',
  },

  // EDUCATION
  {
    key: 'EDUCATION',
    name: 'Educación',
    icon: 'GraduationCap',
    color: 'category-education',
    type: 'EXPENSE',
  },

  // PERSONAL CARE
  {
    key: 'PERSONAL_CARE',
    name: 'Cuidado Personal',
    icon: 'Sparkles',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // FINANCIAL (Movimientos, no gastos reales)
  {
    key: 'TRANSFER',
    name: 'Transferencias',
    icon: 'ArrowLeftRight',
    color: 'category-other',
    type: 'EXPENSE',
  },
  {
    key: 'SAVINGS',
    name: 'Ahorro',
    icon: 'PiggyBank',
    color: 'category-savings',
    type: 'EXPENSE',
  },
  {
    key: 'INVESTMENT',
    name: 'Inversiones',
    icon: 'TrendingUp',
    color: 'category-savings',
    type: 'EXPENSE',
  },

  // OTHER
  {
    key: 'SUBSCRIPTIONS',
    name: 'Suscripciones',
    icon: 'RefreshCcw',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'GIFTS',
    name: 'Regalos',
    icon: 'Gift',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'PETS',
    name: 'Mascotas',
    icon: 'Dog',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'TAXES',
    name: 'Impuestos',
    icon: 'Receipt',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'OTHER',
    name: 'Otros',
    icon: 'MoreHorizontal',
    color: 'category-other',
    type: 'EXPENSE',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed global categories
  console.log('📦 Creating global categories...');
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created ${defaultCategories.length} categories`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
