import { test as baseTest } from '@playwright/test';
import env from '@/../env.config';
import { AuthApi } from '@/helpers/api/controllers/auth.api';
import { ProductsApi } from '@/helpers/api/controllers/products.api';
import { BrandsApi } from '@/helpers/api/controllers/brands.api';
import { createLogger, type Logger } from '@/utils/logger.util';

export interface ApiFixtures {
  authApi: AuthApi;
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  logger: Logger;
}

export const test = baseTest.extend<ApiFixtures>({
  request: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: env.API_BASE_URL,
    });
    await use(requestContext);
    await requestContext.dispose();
  },

  logger: async ({}, use, testInfo) => {
    const testLogger = createLogger(`${testInfo.project.name} › ${testInfo.title}`);
    await use(testLogger);
  },

  authApi: async ({ request }, use) => {
    const authApi = new AuthApi(request);
    await use(authApi);
  },

  productsApi: async ({ request }, use) => {
    const productsApi = new ProductsApi(request);
    await use(productsApi);
  },

  brandsApi: async ({ request }, use) => {
    const brandsApi = new BrandsApi(request);
    await use(brandsApi);
  },
});

export { expect } from '@playwright/test';
