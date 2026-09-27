import { test, expect } from '@/fixtures/api.fixture';
import type { BrandsApiResponse, GenericApiResponse } from '@/types/api.types';
import type { APIResponse } from '@playwright/test';

test.describe('API Feature: Brands Catalog', () => {

  test('API 3: Get All Brands List', async ({ brandsApi, logger }) => {
    logger.info('Starting API 3: Get All Brands List');
    let response: APIResponse;
    let data: BrandsApiResponse;

    await test.step('Send GET request to /api/brandsList', async () => {
      const result = await brandsApi.getAllBrands();
      response = result.response;
      data = result.data;
    });

    await test.step('Verify response status code and brands list in response body', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(200);
      expect(Array.isArray(data.brands)).toBe(true);
      expect(data.brands!.length).toBeGreaterThan(0);

      const firstBrand = data.brands![0];
      expect(firstBrand).toHaveProperty('id');
      expect(firstBrand).toHaveProperty('brand');
    });
  });

  test('API 4: PUT To All Brands List', async ({ brandsApi, logger }) => {
    logger.info('Starting API 4: PUT To All Brands List');
    let response: APIResponse;
    let data: GenericApiResponse;

    await test.step('Send unsupported PUT request to /api/brandsList', async () => {
      const result = await brandsApi.putAllBrands();
      response = result.response;
      data = result.data;
    });

    await test.step('Verify 405 response code and unsupported method message', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(405);
      expect(data.message).toBe('This request method is not supported.');
      logger.info('Received expected 405 method not supported response for PUT');
    });
  });
});
