/**
 * Password hashing utilities using bcrypt
 * Edge Runtime compatible
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash using bcrypt
 * @param hashedPassword - Hashed password
 * @param password - Plain text password to verify
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
