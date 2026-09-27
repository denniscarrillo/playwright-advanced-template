# Playwright Advanced Automation Template V1

[![Playwright Tests](https://img.shields.io/badge/Playwright-1.50+-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A production-ready, scalable test automation template for End-to-End (E2E) and API testing powered by **Playwright** and **TypeScript**. Built with clean architecture principles, strict typing, environment management, declarative steps, and real-world example test suites.

---

## Key Features

- **Page Object Model (POM) + Components**: Modular architecture leveraging [`BasePage`](src/pages/base.page.ts) and reusable components like [`HeaderComponent`](src/pages/components/header.component.ts).
- **API Controller Architecture**: Domain-specific API controllers ([`AuthApi`](src/helpers/api/controllers/auth.api.ts), [`ProductsApi`](src/helpers/api/controllers/products.api.ts), [`BrandsApi`](src/helpers/api/controllers/brands.api.ts)) extending [`BaseApi`](src/helpers/api/base.api.ts) with centralized endpoints in [`endpoints.ts`](src/data/constants/endpoints.ts).
- **Dependency Injection (Modular Fixtures)**: Clean separation between pure API test fixtures ([`api.fixture.ts`](src/fixtures/api.fixture.ts)) and UI Page Object fixtures ([`pages.fixture.ts`](src/fixtures/pages.fixture.ts)).
- **Enterprise Structured Logging**: Powered by **Winston** and **Daily Rotate File** via [`logger.util.ts`](src/utils/logger.util.ts), preventing slow `console.log` calls and preserving rotated execution logs in `logs/`.
- **Declarative `test.step()` Composition**: Human-readable, business-aligned steps providing granular HTML reports and timeline traces.
- **Data Isolation**: Per-test unique data generation with [`generator.util.ts`](src/utils/generator.util.ts) and fast state seeding/teardown via API controllers.
- **Strict Environment Validation**: Schema-validated environment variables via [`env.config.ts`](env.config.ts) and `.env.<env>` ensuring `BASE_URL` and `API_BASE_URL` are strictly defined.
- **Universal AI Agent Ready**: Out-of-the-box instructions for **Antigravity**, **Cursor**, **Windsurf**, **Claude Code**, and **GitHub Copilot** via [`AGENTS.md`](AGENTS.md) and modular skills.

---

## Project Structure

```text
playwright-template-v1/
├── .agents/                                # AI Agent customizations, rules & modular skills
│   └── skills/playwright-automation/       # Playwright architecture & best practices guides
│       ├── SKILL.md
│       └── references/
│           ├── api-testing.md              # API test automation & controller architecture
│           ├── architecture-pom.md         # Page Object Model and Custom Fixtures
│           ├── locators-and-assertions.md  # Resilient locators and web-first assertions
│           ├── test-data-and-api.md        # Dynamic test data and API seeding
│           └── test-steps.md               # Declarative testing with test.step()
├── docs/                                   # Project architecture & system guides
│   ├── auth-setup.md                       # Global authentication setup & session persistence
│   └── logging.md                          # Structured logging with Winston & Daily Rotate
├── logs/                                   # Daily rotated execution & error logs (ignored in git)
├── src/
│   ├── data/                               # Static constants and route endpoints
│   │   ├── constants/auth.ts               # Storage state paths
│   │   ├── constants/endpoints.ts          # Centralized backend API endpoints
│   │   └── constants/routes.ts             # Application URL routes
│   ├── fixtures/                           # Custom Playwright fixtures
│   │   ├── api.fixture.ts                  # Pure API test fixtures (controllers & API logger)
│   │   ├── auth.fixture.ts                 # Session & cookie persistence (storageState)
│   │   └── pages.fixture.ts                # UI Page Objects, Header & AuthApi pre-seeding
│   ├── helpers/                            # Backend API clients and domain controllers
│   │   └── api/
│   │       ├── base.api.ts                 # Base HTTP client with logging & standard methods
│   │       └── controllers/                # Domain API controllers
│   │           ├── auth.api.ts             # Account creation, deletion, login verification
│   │           ├── products.api.ts         # Products catalog & search endpoints
│   │           └── brands.api.ts           # Brands catalog endpoints
│   ├── pages/                              # Page Objects (full views)
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── signup.page.ts
│   │   ├── account-status.page.ts
│   │   ├── products.page.ts
│   │   └── components/                     # Reusable components across views
│   │       └── header.component.ts
│   ├── setup/                              # One-time setup scripts
│   │   └── global.setup.ts                 # Global authentication & cookie persistence
│   ├── types/                              # TypeScript models and interfaces
│   │   ├── api.types.ts                    # API responses and payload models
│   │   └── user.types.ts                   # User credentials and registration models
│   └── utils/                              # Pure utility functions (generators, logger)
│       ├── date.util.ts
│       ├── generator.util.ts
│       └── logger.util.ts                  # Winston + Daily Rotate File configuration
├── tests/
│   ├── api/                                # API test suites (domain grouped)
│   │   ├── auth/                           # Authentication & Account API tests
│   │   ├── brands/                         # Brands catalog API tests
│   │   └── products/                       # Products catalog & search API tests
│   └── e2e/                                # End-to-End user flow tests (grouped by feature)
│       ├── auth/                           # Authentication & User Management E2E
│       └── products/                       # Product catalog & details E2E
├── .env.qa                                 # QA environment configuration
├── AGENTS.md                               # Universal rules and guidelines for AI coding agents
├── env.config.ts                           # Dotenv loader and Zod schema validation
├── package.json                            # Scripts, dependencies, and package metadata
├── playwright.config.ts                    # Multi-browser test runner configuration
└── tsconfig.json                           # TypeScript configuration with path aliases (@/*)
```

---

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or `npm`

### 2. Installation
```bash
# Install dependencies
pnpm install

# Install Playwright browser binaries
pnpm exec playwright install
```

### 3. Environment Configuration
The project uses `.env.<environment>` files (e.g. `.env.qa`). Ensure your environment variables are configured:

```ini
BASE_URL=https://automationexercise.com
API_BASE_URL=https://automationexercise.com
LOGIN_USER=dennisjosecarrillo2018@gmail.com
LOGIN_PASSWORD=YourSecurePassword
```

---

## Running Tests

| Command | Description |
| :--- | :--- |
| `pnpm test` | Run all test suites (API + E2E) in parallel headless mode. |
| `pnpm exec playwright test tests/api/` | Run only the pure API test suites. |
| `pnpm exec playwright test tests/e2e/` | Run only the UI End-to-End test suites. |
| `pnpm test:ui` | Open interactive **Playwright UI Mode** with time-travel debugging. |
| `pnpm test:headed` | Run tests with visible browser windows. |
| `pnpm test:debug` | Run tests in step-by-step Playwright Inspector debug mode. |
| `pnpm report` | Open the interactive HTML report with traces, videos, and screenshots. |

---

## Test Examples

### 1. Pure API Test Example ([`tests/api/products/products-api.spec.ts`](tests/api/products/products-api.spec.ts))

```typescript
import { test, expect } from '@/fixtures/api.fixture';

test.describe('API 5: POST To Search Product', () => {
  test('should search products with keyword "jean" and return matching items', async ({ productsApi }) => {
    let searchResult: Awaited<ReturnType<typeof productsApi.searchProducts>>;

    await test.step('Send POST request to search product by keyword', async () => {
      searchResult = await productsApi.searchProducts('jean');
      expect(searchResult.response.status()).toBe(200);
    });

    await test.step('Verify response status code and products list', async () => {
      expect(searchResult.data.responseCode).toBe(200);
      expect(searchResult.data.products.length).toBeGreaterThan(0);
      for (const product of searchResult.data.products) {
        expect(product.name.toLowerCase()).toContain('jean');
      }
    });
  });
});
```

### 2. Declarative UI E2E Test Example ([`tests/e2e/auth/login.spec.ts`](tests/e2e/auth/login.spec.ts))

```typescript
import { test, expect } from '@/fixtures/pages.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Feature: User Authentication (Login)', () => {
  test('Test Case 1: Login User with correct email and password and delete account', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    authApi,
  }) => {
    const userData = generateRandomRegistrationData('login_user');

    await test.step('Setup: Pre-seed test user via API', async () => {
      const { response, data } = await authApi.createAccount(userData);
      expect(response.status()).toBe(200);
      expect(data.responseCode).toBe(201);
    });

    await test.step('Navigate to home page and verify visibility', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Click on 'Signup / Login' button", async () => {
      await header.goToSignupLogin();
      await expect(loginPage.loginHeading).toBeVisible();
    });

    await test.step('Enter correct email address and password and click login button', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step("Verify that 'Logged in as username' is visible with user name", async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step("Click 'Delete Account' button", async () => {
      await header.deleteAccount();
    });

    await test.step("Verify that 'ACCOUNT DELETED!' is visible and continue", async () => {
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```

---

## Reference Guides & Documentation

Explore the specialized guides and architectural references:
- [Enterprise Architecture & Engineering Master Guide](docs/architecture-guide.md)
- [API Testing & Controller Architecture](.agents/skills/playwright-automation/references/api-testing.md)
- [Page Object Model, Components & Fixtures](.agents/skills/playwright-automation/references/architecture-pom.md)
- [Declarative Test Steps Guide (`test.step()`)](.agents/skills/playwright-automation/references/test-steps.md)
- [Dynamic Test Data & API Preconditions](.agents/skills/playwright-automation/references/test-data-and-api.md)
- [Locators Strategy & Web-First Assertions](.agents/skills/playwright-automation/references/locators-and-assertions.md)
- [Global Auth & Storage State Persistence](docs/auth-setup.md)
- [Structured Logging with Winston](docs/logging.md)
- [Universal AI Agent Guidelines (`AGENTS.md`)](AGENTS.md)
