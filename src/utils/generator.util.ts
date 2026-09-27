import { UserCredentials, UserRegistrationData } from '@/types/user.types';

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

/**
 * Generates complete random user data for signup / registration.
 */
export function generateRandomRegistrationData(prefix = 'qa_user'): UserRegistrationData {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return {
    title: 'Mr',
    name: `User ${uniqueId}`,
    email: `${prefix}_${uniqueId}@example.com`,
    password: `Pass_${uniqueId}!123`,
    birthDay: '15',
    birthMonth: '6',
    birthYear: '1995',
    newsletter: true,
    specialOffers: true,
    address: {
      firstName: 'Dennis',
      lastName: `QA_${uniqueId}`,
      company: 'QA Automation Tech',
      address1: '123 Test Street, Suite 100',
      address2: 'Building B',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      zipcode: '90001',
      mobileNumber: '+1234567890',
    },
  };
}
