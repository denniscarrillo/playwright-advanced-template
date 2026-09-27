# Enterprise Playwright Architecture & Engineering Guide

> **Author**: QA Automation Engineering  
> **Target Audience**: Automation Engineers, QA Leads, Software Engineers, and AI Coding Agents  
> **Scope**: UI End-to-End (E2E) & API Automation Architecture in TypeScript with `@playwright/test`  
> **Language Version**: [Español (Guía en Español)](./architecture-guide.es.md)

---

## Executive Summary & Architectural Philosophy

Modern test automation frameworks often carry technical debt from legacy tools (Selenium, Protractor, Cypress). When moving to **Playwright**, applying old design patterns—such as custom action wrappers, monolithic page objects, static shared logins, and un-typed test execution—creates brittle test suites, slow execution, and debugging nightmares.

This template is architected around **6 core pillars**:
1. **Zero-Wrapper Policy**: Trust and leverage Playwright's native auto-waiting and actionability lifecycle.
2. **Component-Driven Page Object Model (POM)**: Composition over inheritance with `BasePage` and reusable UI components.
3. **Inversion of Control (IoC) via Modular Fixtures**: Eliminate manual class instantiations (`new MyPage()`) and manage test lifecycles via dependency injection.
4. **Hybrid Auth Strategy**: Global Setup (`storageState`) + configurable `useAuth` fixture for isolated guest and authenticated flows.
5. **Decoupled API Controller Architecture**: Strict typed controllers (`BaseApi`) and centralized endpoint routing for fast state seeding and pure API testing.
6. **Fail-Fast Environment Validation**: Strict schema enforcement using Zod to block faulty test runs before any browser opens.

---

## 1. The "Zero-Wrapper" Anti-Pattern vs. Modern Playwright

### The Legacy Problem (Why Selenium/Cypress wrappers existed)
In legacy tools like Selenium Webdriver, elements lacked built-in auto-waiting and actionability checks. Developers had to write helper functions like:
```typescript
// ❌ ANTI-PATTERN: The legacy custom wrapper
async function clickElement(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.locator(selector).click();
}
```

### Why Wrappers Break Playwright
1. **Destroys Auto-Waiting & Actionability Checks**: Playwright locators automatically wait for elements to be:
   - Attached to the DOM
   - Visible
   - Stable (not animating)
   - Able to receive events (not covered by popups or overlays)
   - Enabled and editable
2. **Breaks Playwright Tracing & Time-Travel Debugging**: Custom wrappers hide locator references in stack traces and reports, making failures look like wrapper errors rather than locator assertion timeouts.
3. **Breaks Strict Mode**: Wrapping raw strings prevents Playwright from detecting ambiguous locators (matching > 1 element).
4. **Maintenance Overhead**: When Playwright adds new features (e.g., enhanced locator filters, `click({ noWaitAfter })`), wrappers must be manually updated.

### The Modern Solution: Extension over Wrapping
If custom behavior or assertion logic is needed, **extend Playwright's native APIs** rather than creating procedural wrappers:

```typescript
// ✅ MODERN PATTERN: Extending Playwright Matchers (expect.extend)
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHaveLoadedWithin(locator: Locator, timeoutMs: number) {
    const startTime = Date.now();
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
    const duration = Date.now() - startTime;
    return {
      pass: duration <= timeoutMs,
      message: () => `Element loaded in ${duration}ms (threshold: ${timeoutMs}ms)`,
    };
  },
});
```

---

## 2. Page Object Model (POM) & Component Object Model

### Architectural Hierarchy

```text
┌────────────────────────────────────────────────────────┐
│                      BasePage                          │
│  - Logger injection (createScopedLogger)              │
│  - Navigation (page.goto)                              │
│  - Document metadata (getTitle, getUrl)                │
└───────────┬────────────────────────────────┬───────────┘
            │ Inherits                       │ Contains
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     View Pages        │        │   Component Objects   │
│  - LoginPage          │        │  - HeaderComponent    │
│  - SignupPage         │        │  - NavigationModal    │
│  - ProductsPage       │        │  - ToastNotifications │
└───────────────────────┘        └───────────────────────┘
```

### Best Practices for Page Objects
1. **Expose Locators as `readonly`**: Page Objects should expose locators directly so tests can perform web-first assertions (`await expect(loginPage.heading).toBeVisible()`).
2. **Business Actions Return Data or Promises**: Methods inside Page Objects represent user actions (`await loginPage.login({ email, password })`).
3. **Components for Reusable Widgets**: If a header, modal, or toast appears across multiple pages, encapsulate it in `src/pages/components/` instead of duplicating locators in every Page Object.

---

## 3. Dependency Injection via Modular Fixtures

### Why `new PageObject(page)` inside tests is an Anti-Pattern
Instantiating page objects inside tests creates tight coupling, breaks parallel worker pooling, and leaks lifecycle management:
```typescript
// ❌ ANTI-PATTERN: Manual instantiation inside spec files
test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const header = new HeaderComponent(page);
  // ...
});
```

### The Fixture Injection Pattern
We split fixtures into specialized domains:

```text
src/fixtures/
├── api.fixture.ts    # Pure API testing (injects baseURL, authApi, productsApi, brandsApi)
├── auth.fixture.ts   # Session & storageState management (useAuth option)
└── pages.fixture.ts  # UI E2E testing (injects LoginPage, ProductsPage, HeaderComponent, AuthApi)
```

```typescript
// ✅ MODERN PATTERN: Injected via pages.fixture.ts
import { test, expect } from '@/fixtures/pages.fixture';

test('login test', async ({ loginPage, header, authApi }) => {
  // All objects are cleanly injected and scoped to this test worker
});
```

---

## 4. Authentication Architecture: Global Setup + Dynamic Auth Fixtures

### The Dilemma
- **UI Login Every Test**: Too slow (wastes 5–10 seconds per test).
- **Hardcoded Single Login**: Breaks test isolation and prevents testing different roles (Admin vs. Buyer vs. Guest).

### The Solution: Hybrid Storage State & Context Switching
```
┌────────────────────────────────────────────────────────┐
│ 1. Global Setup (Runs Once Before Workers)            │
│    - Authenticates default user via UI/API             │
│    - Saves cookies/localStorage to user.json           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Auth Fixture (src/fixtures/auth.fixture.ts)         │
│    - test.use({ useAuth: true }) (Default)             │
│      Attaches user.json state (instant authenticated)  │
│    - test.use({ useAuth: false })                      │
│      Spawns clean browser context for guest / signup   │
└────────────────────────────────────────────────────────┘
```

- **Fast-Fail Guard**: If `useAuth: true` is requested but the storage state is missing or corrupted, the test immediately aborts with a clear configuration message instead of waiting for a 30s UI timeout.
- **Native Video / Trace Preservation**: We extend the `storageState` fixture rather than overriding `browser.newContext()` manually, guaranteeing Playwright's automatic video and trace retention on failure.

---

## 5. End-to-End (E2E) Test Architecture

### 1. Declarative `test.step()` Composition
Every test specification must organize its execution into clear, business-aligned `await test.step()` blocks:
- Descriptions in English without sequential numbering (Playwright reports handle numbering).
- Action + verification grouped together in the same step.

```typescript
test('should register and verify account lifecycle', async ({ page, loginPage, header, accountStatusPage }) => {
  const user = generateRandomRegistrationData('qa_user');

  await test.step('Navigate to registration portal', async () => {
    await page.goto('/login');
    await expect(loginPage.signupHeading).toBeVisible();
  });

  await test.step('Complete user registration form', async () => {
    await loginPage.signup(user.name, user.email);
    // ...
  });
});
```

### 2. Isolated Test Data Generation
Never rely on static credentials for destructive actions (e.g. account deletion). Generate isolated data per test using [`generator.util.ts`](../src/utils/generator.util.ts):
```typescript
const userData = generateRandomRegistrationData('order_user');
// Produces: { email: 'order_user_k9a21x@example.com', name: 'User k9a21x', ... }
```

### 3. Feature Organization & Balanced Workers
- Feature-based directories under `tests/e2e/<feature>/` (e.g., `tests/e2e/auth/`, `tests/e2e/products/`).
- **Maximum 4 tests per `.spec.ts` file** to maintain fast parallel execution across workers and clean file readability.

---

## 6. API Automation Architecture

### Layered API Design

```text
┌────────────────────────────────────────────────────────────────┐
│  Tests: tests/api/<domain>/<name>.spec.ts                      │
│  (injected with typed controllers via api.fixture.ts)          │
└───────────────────────────────┬────────────────────────────────┘
                                │ Calls
┌───────────────────────────────▼────────────────────────────────┐
│  Controllers: src/helpers/api/controllers/                     │
│  - AuthApi: createAccount, deleteAccount, verifyLogin          │
│  - ProductsApi: getAllProducts, postAllProducts, searchProducts│
│  - BrandsApi: getAllBrands, putAllBrands                       │
└───────────────────────────────┬────────────────────────────────┘
                                │ Inherits
┌───────────────────────────────▼────────────────────────────────┐
│  Base Class: BaseApi (src/helpers/api/base.api.ts)             │
│  - Structured Logger (Winston)                                 │
│  - Bearer Token Auth Handler (setAuthToken)                    │
│  - get, post, postForm, put, delete methods                   │
└───────────────────────────────┬────────────────────────────────┘
                                │ Reads
┌───────────────────────────────▼────────────────────────────────┐
│  Constants: API_ENDPOINTS (src/data/constants/endpoints.ts)    │
└────────────────────────────────────────────────────────────────┘
```

### Key API Automation Principles
1. **Pure API Fixtures**: API tests use `src/fixtures/api.fixture.ts`, which sets `baseURL: env.API_BASE_URL` on `request` and injects domain controllers without spinning up browser tabs.
2. **Centralized Endpoints**: Never hardcode string paths in tests or controllers; reference `API_ENDPOINTS.<DOMAIN>.<ACTION>`.
3. **Dual Assertions**: Assert both HTTP response status (`expect(res.status()).toBe(200)`) and the response body schema (`expect(data.responseCode).toBe(200)`).
4. **Fast Pre-seeding & Teardown**: E2E tests can inject `authApi` from `pages.fixture.ts` to pre-seed users via HTTP in 100ms before running UI flows.

---

## 7. Fail-Fast Environment Validation (Zod)

### The Problem
If a test suite runs in CI with a missing or misspelled environment variable (e.g. `API_BASE_URL`), tests fail midway through execution with cryptic network timeouts.

### The Solution: Strict Zod Parsing ([`env.config.ts`](../env.config.ts))
```typescript
import { z } from 'zod';

const baseSchema = z.object({
  BASE_URL: z.url(),
  API_BASE_URL: z.url(),
  LOGIN_USER: z.string(),
  LOGIN_PASSWORD: z.string(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const devSchema = baseSchema.extend({ ENV: z.literal('dev') });
const qaSchema = baseSchema.extend({ ENV: z.literal('qa') });

const envSchema = z.discriminatedUnion('ENV', [devSchema, qaSchema]);

const env = envSchema.parse({
  ...process.env,
  ENV: process.env.ENV ?? 'qa',
});

export default env;
```

**Why this matters**:
- Validates that `BASE_URL` and `API_BASE_URL` are valid URLs before tests execute.
- Prevents silent fallback bugs: if an environment variable is omitted, Zod throws immediately upon boot.

---

## 8. Summary Comparison Table

| Dimension | Legacy / Anti-Pattern Approach | Enterprise Modern Playwright Template |
| :--- | :--- | :--- |
| **Element Interactions** | Custom wrappers (`clickElement`, `typeText`) | Native auto-retrying locators (`locator.click()`, `locator.fill()`) |
| **Assertions** | `assert`/`expect` on boolean flags (`expect(await isVisible()).toBe(true)`) | Web-first retrying assertions (`await expect(locator).toBeVisible()`) |
| **Page Object Lifecycle** | `new PageObject(page)` inside test body | Inversion of Control via custom fixtures (`pages.fixture.ts`) |
| **Authentication** | Manual UI login in `beforeEach` for every single test | Hybrid: `global.setup.ts` + `storageState` + `useAuth` fixture option |
| **API Testing** | Disorganized inline `request.get('/api/...')` calls | Domain Controllers inheriting from `BaseApi` + centralized `API_ENDPOINTS` |
| **Test Steps** | Unstructured code or numeric comments (`// 1. click`) | Declarative `await test.step('Description', async () => {})` blocks |
| **Environment Config** | Untyped `process.env.MY_VAR \|\| 'default'` | Strict type validation with Zod discriminated unions in `env.config.ts` |
| **Execution Logging** | Synchronous `console.log` | Winston structured logger with Daily Rotate File and worker tagging |
