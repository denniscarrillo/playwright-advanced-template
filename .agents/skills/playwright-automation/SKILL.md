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
- [Page Object Model, Components & Fixtures](./references/architecture-pom.md): Architectural layout of `BasePage`, reusable `Component` classes, and custom Playwright fixtures.
- [Dynamic Test Data & API Helpers](./references/test-data-and-api.md): Using generator utilities and API request helpers for test isolation and teardown.
- [Locators & Web-First Assertions](./references/locators-and-assertions.md): Selector priority, avoiding strict mode violations, and resilient assertions.

---

## Standard Test Case Template

```typescript
import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case Suite: <Feature Name>', () => {
  test('debe ejecutar el flujo esperado de inicio a fin', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    apiHelper,
  }) => {
    const userData = generateRandomRegistrationData('qa_user');

    await test.step('Preparación: Generar y crear datos de prueba vía API', async () => {
      const response = await apiHelper.createAccount(userData);
      expect(response.status()).toBe(200);
    });

    await test.step('1. Navegar a la página principal y verificar visibilidad', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    await test.step("2. Acceder al formulario de Login", async () => {
      await header.goToSignupLogin();
      await expect(loginPage.loginHeading).toBeVisible();
    });

    await test.step('3. Iniciar sesión con las credenciales creadas', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step('4. Validar que la sesión se encuentra activa', async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step('5. Limpiar datos eliminando la cuenta creada', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```
