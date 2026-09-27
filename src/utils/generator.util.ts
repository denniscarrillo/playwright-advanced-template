import { UserCredentials } from '@/types/user.types';

/**
 * Generates random user credentials for testing.
 */
export function generateRandomUser(prefix = 'test_user'): UserCredentials {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return {
    email: `${prefix}_${uniqueId}@example.com`,
    password: `Pass_${uniqueId}!123`,
  };
}
