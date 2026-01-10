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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.warn('🧹 Cleaning duplicate categories...');

  // Delete all user-created custom categories
  const deletedCustom = await prisma.category.deleteMany({
    where: {
      userId: { not: null },
    },
  });

  console.warn(`🗑️  Deleted ${deletedCustom.count} custom user categories`);

  // Delete all global categories to reset
  const deletedGlobal = await prisma.category.deleteMany({
    where: {
      userId: null,
    },
  });

  console.warn(`🗑️  Deleted ${deletedGlobal.count} global categories`);

  console.warn('✅ Categories cleaned! Run seed to recreate them.');
}

main()
  .catch((e) => {
    console.error('❌ Error cleaning categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
