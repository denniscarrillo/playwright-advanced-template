import { test, expect } from '@/fixtures/api.fixture';
import type { ProductsApiResponse, GenericApiResponse } from '@/types/api.types';
import type { APIResponse } from '@playwright/test';

test.describe('API Feature: Products Catalog', () => {

  test('API 1: Get All Products List', async ({ productsApi, logger }) => {
    logger.info('Starting API 1: Get All Products List');
    let response: APIResponse;
    let data: ProductsApiResponse;

    await test.step('Send GET request to /api/productsList', async () => {
      const result = await productsApi.getAllProducts();
      response = result.response;
      data = result.data;
    });

    await test.step('Verify response status code and products list in response body', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(200);
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products!.length).toBeGreaterThan(0);

      const firstProduct = data.products![0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('price');
      expect(firstProduct).toHaveProperty('brand');
      expect(firstProduct).toHaveProperty('category');
    });
  });

  test('API 2: POST To All Products List', async ({ productsApi, logger }) => {
    logger.info('Starting API 2: POST To All Products List');
    let response: APIResponse;
    let data: GenericApiResponse;

    await test.step('Send unsupported POST request to /api/productsList', async () => {
      const result = await productsApi.postAllProducts();
      response = result.response;
      data = result.data;
    });

    await test.step('Verify 405 response code and unsupported method message', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(405);
      expect(data.message).toBe('This request method is not supported.');
      logger.info('Received expected 405 method not supported response');
    });
  });

  test('API 5: POST To Search Product', async ({ productsApi, logger }) => {
    logger.info('Starting API 5: POST To Search Product');
    const searchTerm = 'top';
    let response: APIResponse;
    let data: ProductsApiResponse;

    await test.step(`Send POST request to /api/searchProduct with keyword "${searchTerm}"`, async () => {
      const result = await productsApi.searchProducts(searchTerm);
      response = result.response;
      data = result.data;
    });

    await test.step('Verify response code and matched products list', async () => {
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(200);
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products!.length).toBeGreaterThan(0);

      const allMatch = data.products!.some((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(allMatch).toBe(true);
    });
  });
});
