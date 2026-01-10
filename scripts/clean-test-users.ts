/**
 * Clean test users from database
 * Run with: npx tsx scripts/clean-test-users.ts
 */
import { db } from '../src/shared/lib/db';

async function main() {
  // eslint-disable-next-line no-console
  console.log('🧹 Cleaning test users from database...');

  // Delete test users (created by integration tests)
  const result = await db.user.deleteMany({
    where: {
      OR: [
        { email: { contains: '@example.com' } },
        { email: { startsWith: 'test' } },
        { name: { contains: 'Test' } },
      ],
    },
  });

  // eslint-disable-next-line no-console
  console.log(`✅ Deleted ${result.count} test users`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
