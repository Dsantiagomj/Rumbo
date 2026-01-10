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
  {
    key: 'FOOD',
    name: 'Alimentación',
    icon: 'ShoppingCart',
    color: 'category-food',
    type: 'EXPENSE',
  },
  {
    key: 'TRANSPORT',
    name: 'Transporte',
    icon: 'Bus',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'BILLS',
    name: 'Servicios',
    icon: 'Lightbulb',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'ENTERTAINMENT',
    name: 'Entretenimiento',
    icon: 'Film',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'HEALTH',
    name: 'Salud',
    icon: 'Heart',
    color: 'category-health',
    type: 'EXPENSE',
  },
  {
    key: 'EDUCATION',
    name: 'Educación',
    icon: 'GraduationCap',
    color: 'category-education',
    type: 'EXPENSE',
  },
  {
    key: 'PERSONAL',
    name: 'Personal',
    icon: 'User',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'DEBT',
    name: 'Deudas',
    icon: 'CreditCard',
    color: 'category-debt',
    type: 'EXPENSE',
  },
  {
    key: 'SAVINGS',
    name: 'Ahorro',
    icon: 'PiggyBank',
    color: 'category-savings',
    type: 'INCOME',
  },
  {
    key: 'INCOME',
    name: 'Ingresos',
    icon: 'TrendingUp',
    color: 'financial-positive',
    type: 'INCOME',
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
