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
  // ============================================
  // INCOME CATEGORIES (8)
  // ============================================
  {
    key: 'SALARY',
    name: 'Salary',
    icon: 'Briefcase',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'FREELANCE',
    name: 'Freelance',
    icon: 'Laptop',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'INVESTMENT_RETURNS',
    name: 'Investment Returns',
    icon: 'TrendingUp',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'GIFTS_RECEIVED',
    name: 'Gifts Received',
    icon: 'Gift',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'LOAN_REPAYMENT',
    name: 'Loan Repayment',
    icon: 'DollarSign',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'BUSINESS_INCOME',
    name: 'Business Income',
    icon: 'Store',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'RENTAL_INCOME',
    name: 'Rental Income',
    icon: 'Building',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'OTHER_INCOME',
    name: 'Other Income',
    icon: 'Plus',
    color: 'financial-positive',
    type: 'INCOME',
  },

  // ============================================
  // EXPENSE CATEGORIES (14)
  // ============================================
  {
    key: 'FOOD_DINING',
    name: 'Food & Dining',
    icon: 'UtensilsCrossed',
    color: 'category-food',
    type: 'EXPENSE',
  },
  {
    key: 'TRANSPORT',
    name: 'Transport',
    icon: 'Car',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'HOUSING',
    name: 'Housing',
    icon: 'Home',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'UTILITIES',
    name: 'Utilities',
    icon: 'Lightbulb',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'GROCERIES',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: 'category-food',
    type: 'EXPENSE',
  },
  {
    key: 'SHOPPING',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'HEALTH',
    name: 'Health',
    icon: 'Heart',
    color: 'category-health',
    type: 'EXPENSE',
  },
  {
    key: 'EDUCATION',
    name: 'Education',
    icon: 'GraduationCap',
    color: 'category-education',
    type: 'EXPENSE',
  },
  {
    key: 'ENTERTAINMENT',
    name: 'Entertainment',
    icon: 'Film',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'TRAVEL',
    name: 'Travel',
    icon: 'Plane',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'SUBSCRIPTIONS',
    name: 'Subscriptions',
    icon: 'RefreshCcw',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'GIFTS',
    name: 'Gifts',
    icon: 'Gift',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'PETS',
    name: 'Pets',
    icon: 'Dog',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'OTHER_EXPENSES',
    name: 'Other Expenses',
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
