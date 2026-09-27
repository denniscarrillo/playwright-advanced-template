# Dynamic Test Data & API Setup / Teardown

To ensure test isolation, prevent flake, and avoid race conditions during parallel execution, tests should generate unique data per execution and leverage API endpoints for fast pre-test seeding and post-test teardown.

---

## 1. Dynamic Data Generation (`generator.util.ts`)

Never hardcode shared user accounts for destructive actions (e.g. deleting an account). Instead, use dynamic generator functions:

```typescript
import { UserCredentials, UserRegistrationData } from '@/types/user.types';

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
      company: 'QA Tech',
      address1: '123 Test Street, Suite 100',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      zipcode: '90001',
      mobileNumber: '+1234567890',
    },
  };
}
```

---

## 2. API Seed / Teardown with Domain Controllers (`AuthApi`)

Use [`AuthApi`](src/helpers/api/controllers/auth.api.ts) via Playwright's `request` context to create test preconditions in milliseconds without going through multi-step UI forms:

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from '@/helpers/api/base.api';
import { API_ENDPOINTS } from '@/data/constants/endpoints';
import { UserRegistrationData } from '@/types/user.types';
import type { GenericApiResponse } from '@/types/api.types';

export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request, 'AuthApi');
  }

  async createAccount(userData: UserRegistrationData): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Creating account via API for: ${userData.email}`);
    const response = await this.postForm(API_ENDPOINTS.AUTH.CREATE_ACCOUNT, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      title: userData.title ?? 'Mr',
      birth_date: userData.birthDay ?? '1',
      birth_month: userData.birthMonth ?? '1',
      birth_year: userData.birthYear ?? '1990',
      firstname: userData.address.firstName,
      lastname: userData.address.lastName,
      company: userData.address.company ?? '',
      address1: userData.address.address1,
      address2: userData.address.address2 ?? '',
      country: userData.address.country,
      zipcode: userData.address.zipcode,
      state: userData.address.state,
      city: userData.address.city,
      mobile_number: userData.address.mobileNumber,
    });
    const data = (await response.json()) as GenericApiResponse;
    return { response, data };
  }

  async deleteAccount(email: string, password: string): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Deleting account via API for: ${email}`);
    const response = await this.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, { email, password });
    const data = (await response.json()) as GenericApiResponse;
    return { response, data };
  }
}
```

---

## 3. Best Practices

1. **Avoid Shared Mutable State**: Each test should own its own data generated dynamically via `generateRandomRegistrationData()`.
2. **Speed up Setup with API**: For tests focused on checkout, login, or cart, create the user or seed products via API rather than repeating UI registration steps.
3. **Clean Up**: Delete transient entities either via the UI step (if part of the test case) or in an `afterEach` hook using `authApi.deleteAccount(userData.email, userData.password)`.
4. **Fixture Injection**: Always inject `authApi` from `@/fixtures/pages.fixture` or `@/fixtures/api.fixture` instead of manual instantiation.

