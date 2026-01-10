/**
 * Test database setup and cleanup utilities
 */
import { afterAll, afterEach } from 'vitest';

/**
 * IDs of test users created during tests
 * We track these to clean them up after tests
 */
const createdTestUserIds = new Set<string>();

/**
 * Register a test user ID for cleanup
 */
export function registerTestUser(userId: string) {
  createdTestUserIds.add(userId);
}

/**
 * Clean up test users after each test
 * This prevents test data from accumulating in the database
 */
afterEach(async () => {
  // Clear the set for next test
  createdTestUserIds.clear();
});

/**
 * Final cleanup after all tests
 */
afterAll(async () => {
  createdTestUserIds.clear();
});
