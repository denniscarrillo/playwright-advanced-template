---
name: playwright-automation
description: Comprehensive guide and best practices for authoring, structuring, and maintaining Playwright end-to-end and API tests, Page Object Models, declarative steps, test data, and fixtures.
---

# Playwright Automation Architecture & Authoring Guide

This skill provides complete guidelines, patterns, and architectural standards for writing maintainable, declarative, and robust Playwright test suites.

---

## Quick Reference & Workflow

When authoring or modifying automated tests in this repository, follow this workflow:

1. **Inspect Live Page**: Use the `playwright-cli` skill to open target URLs, inspect the DOM, and test selectors before writing code.
2. **Page & Component Modeling**: Encapsulate locators and UI actions inside Page Objects inheriting from `BasePage` and reusable Components.
3. **Declarative Step Composition**: Structure all test specifications with `await test.step()` blocks.
4. **Data Isolation**: Seed unique test data dynamically and utilize `ApiHelper` for fast preconditions.
5. **Web-First Assertions**: Validate state using auto-retrying `await expect(...)` matchers.

---

## Modular Reference Guides

Refer to the specialized guides in `references/` for detailed implementations:

- [Declarative Test Steps with `test.step()`](./references/test-steps.md): How to structure tests into clear business steps for superior reporting and debugging.
- [API Test Automation & Controllers](./references/api-testing.md): Architecture of `BaseApi`, domain controllers, `API_ENDPOINTS` constants, and pure API fixtures.
- [Page Object Model, Components & Fixtures](./references/architecture-pom.md): Architectural layout of `BasePage`, reusable `Component` classes, and custom Playwright fixtures.
- [Dynamic Test Data & API Helpers](./references/test-data-and-api.md): Using generator utilities and API controllers for test isolation and teardown.
- [Locators & Web-First Assertions](./references/locators-and-assertions.md): Selector priority, avoiding strict mode violations, and resilient assertions.

---

## Standard Test Templates

### 1. End-to-End (E2E) UI Test Template

```typescript
import { test, expect } from '@/fixtures/pages.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case Suite: <Feature Name>', () => {
  test('should execute the expected flow from end to end', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    authApi,
  }) => {
    const userData = generateRandomRegistrationData('qa_user');

    await test.step('Setup: Pre-seed test user via API', async () => {
      const { response } = await authApi.createAccount(userData);
      expect(response.status()).toBe(200);
    });

    await test.step('Navigate to home page and verify visibility', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Navigate to 'Signup / Login' form", async () => {
      await header.goToSignupLogin();
      await expect(loginPage.loginHeading).toBeVisible();
    });

    await test.step('Log in with created credentials', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step('Verify that session is active with correct user', async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step('Teardown: Delete created account', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```

### 2. API Test Template

```typescript
import { test, expect } from '@/fixtures/api.fixture';

test.describe('API Suite: <Feature Domain>', () => {
  test('should fetch and validate resource response', async ({ productsApi }) => {
    let result: Awaited<ReturnType<typeof productsApi.getAllProducts>>;

    await test.step('Send GET request for products list', async () => {
      result = await productsApi.getAllProducts();
      expect(result.response.status()).toBe(200);
    });

    await test.step('Verify response payload and business schema', async () => {
      expect(result.data.responseCode).toBe(200);
      expect(result.data.products.length).toBeGreaterThan(0);
    });
  });
});
```
