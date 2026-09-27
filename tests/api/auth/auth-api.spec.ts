import { test, expect } from '@/fixtures/api.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';
import type { UserRegistrationData } from '@/types/user.types';
import type { APIResponse } from '@playwright/test';
import type { GenericApiResponse, UserDetailApiResponse } from '@/types/api.types';

test.describe('API Feature: Authentication & User Details', () => {
  let testUser: UserRegistrationData;

  test.beforeEach(async ({ authApi }) => {
    testUser = generateRandomRegistrationData('auth_api_user');
    const { response, data } = await authApi.createAccount(testUser);
    expect(response.status()).toBe(200);
    expect(data.responseCode).toBe(201);
  });

  test.afterEach(async ({ authApi }) => {
    await authApi.deleteAccount(testUser.email, testUser.password);
  });

  test('API 7: POST To Verify Login with valid details', async ({ authApi, logger }) => {
    logger.info(`Starting API 7: Verify login with valid credentials for: ${testUser.email}`);
    let response: APIResponse;
    let data: GenericApiResponse;

    await test.step('Send POST request to /api/verifyLogin with valid credentials', async () => {
      const result = await authApi.verifyLogin(testUser.email, testUser.password);
      response = result.response;
      data = result.data;
    });

    await test.step('Verify 200 response code and success message', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(200);
      expect(data.message).toBe('User exists!');
      logger.info('Valid login verified successfully');
    });
  });

  test('API 8: POST To Verify Login without email parameter', async ({ authApi, logger }) => {
    logger.info('Starting API 8: Verify login without email parameter (Bad Request)');
    let response: APIResponse;
    let data: GenericApiResponse;

    await test.step('Send POST request to /api/verifyLogin without email parameter', async () => {
      const result = await authApi.verifyLogin(undefined, testUser.password);
      response = result.response;
      data = result.data;
    });

    await test.step('Verify 400 Bad Request response code and missing parameter message', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(400);
      expect(data.message).toBe('Bad request, email or password parameter is missing in POST request.');
      logger.info('Missing email parameter rejected as expected');
    });
  });

  test('API 10: POST To Verify Login with invalid details', async ({ authApi, logger }) => {
    logger.info('Starting API 10: Verify login with invalid credentials');
    let response: APIResponse;
    let data: GenericApiResponse;

    await test.step('Send POST request to /api/verifyLogin with invalid password', async () => {
      const result = await authApi.verifyLogin(testUser.email, 'IncorrectPassword999!');
      response = result.response;
      data = result.data;
    });

    await test.step('Verify 404 response code and user not found message', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(404);
      expect(data.message).toBe('User not found!');
      logger.info('Invalid login rejected as expected');
    });
  });

  test('API 14: GET user account detail by email', async ({ authApi, logger }) => {
    logger.info(`Starting API 14: Fetch user account details for: ${testUser.email}`);
    let response: APIResponse;
    let data: UserDetailApiResponse;

    await test.step('Send GET request to /api/getUserDetailByEmail', async () => {
      const result = await authApi.getUserDetailByEmail(testUser.email);
      response = result.response;
      data = result.data;
    });

    await test.step('Verify response code and user profile details matching registration data', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(200);
      expect(data.user).toBeDefined();

      expect(data.user!.email).toBe(testUser.email);
      expect(data.user!.name).toBe(testUser.name);
      expect(data.user!.first_name).toBe(testUser.address.firstName);
      expect(data.user!.last_name).toBe(testUser.address.lastName);
      expect(data.user!.city).toBe(testUser.address.city);
      expect(data.user!.country).toBe(testUser.address.country);

      logger.info('User account details verified successfully');
    });
  });
});
