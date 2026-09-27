# API Test Automation & Controller Architecture

This document describes the architectural standards, patterns, and best practices for authoring API test automation suites and domain controllers using Playwright's `APIRequestContext`.

---

## 1. Architecture Overview

API testing in this repository is built on four decoupled layers:

```text
┌────────────────────────────────────────────────────────┐
│  Tests Layer: tests/api/<domain>/<name>.spec.ts        │
│  (uses test & expect from @/fixtures/api.fixture)      │
└───────────────────────────┬────────────────────────────┘
                            │ Injects
┌───────────────────────────▼────────────────────────────┐
│  Fixtures Layer: src/fixtures/api.fixture.ts           │
│  (Provides baseURL from env.API_BASE_URL, controllers) │
└───────────────────────────┬────────────────────────────┘
                            │ Instantiates
┌───────────────────────────▼────────────────────────────┐
│  Controllers Layer: src/helpers/api/controllers/       │
│  (AuthApi, ProductsApi, BrandsApi extends BaseApi)     │
└───────────────────────────┬────────────────────────────┘
                            │ Uses
┌───────────────────────────▼────────────────────────────┐
│  Core & Constants: BaseApi & API_ENDPOINTS             │
│  (src/helpers/api/base.api.ts & src/data/constants)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Centralized Endpoints Mapping (`endpoints.ts`)

Never hardcode endpoint URLs inside controllers or tests. Define all API paths in [`src/data/constants/endpoints.ts`](src/data/constants/endpoints.ts):

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    CREATE_ACCOUNT: '/api/createAccount',
    DELETE_ACCOUNT: '/api/deleteAccount',
    VERIFY_LOGIN: '/api/verifyLogin',
    GET_USER_DETAIL_BY_EMAIL: '/api/getUserDetailByEmail',
  },
  PRODUCTS: {
    LIST: '/api/productsList',
    SEARCH: '/api/searchProduct',
  },
  BRANDS: {
    LIST: '/api/brandsList',
  },
} as const;
```

---

## 3. Base API Controller (`BaseApi`)

All domain controllers must inherit from [`BaseApi`](src/helpers/api/base.api.ts), which wraps `APIRequestContext` with structured logging, headers, and standard HTTP verb helpers:

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from 'winston';
import { createScopedLogger } from '@/utils/logger.util';

export abstract class BaseApi {
  protected readonly logger: Logger;
  protected defaultHeaders: Record<string, string>;

  constructor(
    protected readonly request: APIRequestContext,
    loggerContext = 'BaseApi',
  ) {
    this.logger = createScopedLogger(loggerContext);
    this.defaultHeaders = {
      Accept: 'application/json',
    };
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  async get(endpoint: string, params?: Record<string, string | number | boolean>): Promise<APIResponse> {
    return this.request.get(endpoint, {
      headers: this.defaultHeaders,
      params,
    });
  }

  async post(endpoint: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(endpoint, {
      headers: { ...this.defaultHeaders, 'Content-Type': 'application/json' },
      data,
    });
  }

  async postForm(endpoint: string, form: Record<string, string | number | boolean>): Promise<APIResponse> {
    return this.request.post(endpoint, {
      headers: this.defaultHeaders,
      form,
    });
  }

  async delete(endpoint: string, form?: Record<string, string | number | boolean>): Promise<APIResponse> {
    return this.request.delete(endpoint, {
      headers: this.defaultHeaders,
      form,
    });
  }
}
```

---

## 4. Domain Controllers (`src/helpers/api/controllers/`)

Encapsulate each domain/resource inside its own controller class. Controllers return both the raw `APIResponse` and the parsed response model:

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from '@/helpers/api/base.api';
import { API_ENDPOINTS } from '@/data/constants/endpoints';
import type { ProductsApiResponse } from '@/types/api.types';

export class ProductsApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request, 'ProductsApi');
  }

  async getAllProducts(): Promise<{ response: APIResponse; data: ProductsApiResponse }> {
    this.logger.info(`Fetching all products via GET ${API_ENDPOINTS.PRODUCTS.LIST}`);
    const response = await this.get(API_ENDPOINTS.PRODUCTS.LIST);
    const data = (await response.json()) as ProductsApiResponse;
    return { response, data };
  }

  async searchProducts(keyword: string): Promise<{ response: APIResponse; data: ProductsApiResponse }> {
    this.logger.info(`Searching products with keyword "${keyword}"`);
    const response = await this.postForm(API_ENDPOINTS.PRODUCTS.SEARCH, {
      search_product: keyword,
    });
    const data = (await response.json()) as ProductsApiResponse;
    return { response, data };
  }
}
```

---

## 5. Pure API Fixtures (`src/fixtures/api.fixture.ts`)

API tests should not spin up browser pages or load UI Page Objects. Use [`api.fixture.ts`](src/fixtures/api.fixture.ts) which configures `baseURL: env.API_BASE_URL` and injects all controllers:

```typescript
import { test as baseTest, expect, APIRequestContext } from '@playwright/test';
import { AuthApi } from '@/helpers/api/controllers/auth.api';
import { ProductsApi } from '@/helpers/api/controllers/products.api';
import { BrandsApi } from '@/helpers/api/controllers/brands.api';
import env from '@/env.config';

export interface ApiFixtures {
  authApi: AuthApi;
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
}

export const test = baseTest.extend<ApiFixtures>({
  baseURL: async ({}, use) => {
    await use(env.API_BASE_URL);
  },
  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },
  productsApi: async ({ request }, use) => {
    await use(new ProductsApi(request));
  },
  brandsApi: async ({ request }, use) => {
    await use(new BrandsApi(request));
  },
});

export { expect };
```

---

## 6. Standard Declarative API Test Pattern

Structure all API tests with `await test.step()` and web-first / Playwright matchers:

```typescript
import { test, expect } from '@/fixtures/api.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('API: Product Search & Verification', () => {
  test('should search products and return matching items', async ({ productsApi }) => {
    let searchResult: Awaited<ReturnType<typeof productsApi.searchProducts>>;

    await test.step('Send POST request to search product by keyword', async () => {
      searchResult = await productsApi.searchProducts('jean');
      expect(searchResult.response.status()).toBe(200);
      expect(searchResult.data.responseCode).toBe(200);
    });

    await test.step('Verify search results contains matching products', async () => {
      expect(searchResult.data.products).toBeDefined();
      expect(searchResult.data.products.length).toBeGreaterThan(0);
      for (const product of searchResult.data.products) {
        expect(product.name.toLowerCase()).toContain('jean');
      }
    });
  });
});
```

---

## 7. Mandatory Rules for API Testing

1. **Strict Environment Requirement**: `API_BASE_URL` is mandatory in `.env.<env>` and validated with `z.url()`. Never use fallback URLs or `.transform()`.
2. **Never instantiate controllers directly in tests**: Always inject them via the `api.fixture.ts` fixture.
3. **Always use declarative `test.step()`**: Group the HTTP request call and its status/schema assertions inside clear English step descriptions.
4. **Clean up generated state**: For any test that seeds user accounts via `authApi.createAccount()`, ensure teardown via `authApi.deleteAccount()` in `afterEach` or in the final test step.
5. **Max 4 tests per spec file**: Group closely related API specs under `tests/api/<feature>/` (e.g. `tests/api/auth/`, `tests/api/products/`).
