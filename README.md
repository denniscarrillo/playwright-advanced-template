# Playwright Advanced Automation Template V1

[![Playwright Tests](https://img.shields.io/badge/Playwright-1.50+-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A production-ready, scalable test automation template for End-to-End (E2E) and API testing powered by **Playwright** and **TypeScript**. Built with clean architecture principles, strict typing, environment management, declarative steps, and real-world example test suites.

---

## Key Features

- **Page Object Model (POM) + Components**: Modular architecture leveraging [`BasePage`](src/pages/base.page.ts) and reusable components like [`HeaderComponent`](src/pages/components/header.component.ts).
- **Dependency Injection (Custom Fixtures)**: All pages, components, API helpers, and logger are injected via [`base.fixture.ts`](src/fixtures/base.fixture.ts).
- **Enterprise Structured Logging**: Powered by **Winston** and **Daily Rotate File** via [`logger.util.ts`](src/utils/logger.util.ts), preventing slow `console.log` calls and preserving rotated execution logs in `logs/`.
- **Declarative `test.step()` Composition**: Human-readable, business-aligned steps providing granular HTML reports and timeline traces.
- **Data Isolation & API Helpers**: Per-test unique data generation with [`generator.util.ts`](src/utils/generator.util.ts) and fast state seeding/teardown via [`ApiHelper`](src/helpers/api.helper.ts).
- **Environment Validation with Zod**: Strongly typed, schema-validated environment variables via [`env.config.ts`](env.config.ts) and `.env.<env>`.
- **Universal AI Agent Ready**: Out-of-the-box instructions for **Antigravity**, **Cursor**, **Windsurf**, **Claude Code**, and **GitHub Copilot** via [`AGENTS.md`](AGENTS.md).

---

## Project Structure

```text
playwright-template-v1/
├── .agents/                                # AI Agent customizations, rules & modular skills
│   └── skills/playwright-automation/       # Playwright architecture & best practices guides
│       ├── SKILL.md
│       └── references/
│           ├── test-steps.md               # Declarative testing with test.step()
│           ├── architecture-pom.md         # Page Object Model and Custom Fixtures
│           ├── test-data-and-api.md        # Dynamic test data and API helpers
│           └── locators-and-assertions.md  # Resilient locators and web-first assertions
├── docs/                                   # Project architecture & system guides
│   ├── auth-setup.md                       # Global authentication setup & session persistence
│   └── logging.md                          # Structured logging with Winston & Daily Rotate
├── logs/                                   # Daily rotated execution & error logs (ignored in git)
├── src/
│   ├── data/                               # Static constants and route endpoints
│   │   └── constants/routes.ts
│   ├── fixtures/                           # Custom Playwright fixtures (injects pages, helpers, logger)
│   │   └── base.fixture.ts
│   ├── helpers/                            # HTTP clients and backend API helpers
│   │   └── api.helper.ts
│   ├── pages/                              # Page Objects (full views)
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── signup.page.ts
│   │   ├── account-status.page.ts
│   │   └── components/                     # Reusable components across views
│   │       └── header.component.ts
│   ├── types/                              # TypeScript models and interfaces
│   │   └── user.types.ts
│   └── utils/                              # Pure utility functions (generators, logger)
│       ├── date.util.ts
│       ├── generator.util.ts
│       └── logger.util.ts                  # Winston + Daily Rotate File configuration
├── tests/
│   ├── api/                                # API / service tests
│   └── e2e/                                # End-to-End user flow tests
│       ├── login.spec.ts                   # Example: Dynamic credentials + API setup + login flow
│       └── signup.spec.ts                  # Example: Full registration and teardown flow
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
The project uses `.env.<environment>` files (e.g. `.env.qa`). Ensure your environment file is configured:

```ini
BASE_URL=https://www.automationexercise.com
DEFAULT_USER=your_user@email.com
DEFAULT_PASSWORD=YourSecurePassword
```

---

## Running Tests

| Command | Description |
| :--- | :--- |
| `pnpm test` | Run all test suites in headless mode across configured browsers. |
| `pnpm test:ui` | Open the interactive **Playwright UI Mode** with time-travel debugging. |
| `pnpm test:headed` | Run tests with visible browser windows. |
| `pnpm test:debug` | Run tests in step-by-step Playwright Inspector debug mode. |
| `pnpm report` | Open the interactive HTML report with traces, videos, and screenshots. |

### Targeted Test Execution
```bash
# Run a specific test file
pnpm exec playwright test tests/e2e/login.spec.ts

# Run tests on a specific browser project (e.g., Chromium)
pnpm exec playwright test --project=chromium
```

---

## Declarative Test Example

Tests in this template use `test.step()` blocks to ensure each step is self-documenting in both code and test execution reports:

```typescript
import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('User Authentication Suite', () => {
  test('should successfully authenticate with valid credentials and delete account', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    apiHelper,
  }) => {
    const userData = generateRandomRegistrationData('login_user');

    await test.step('Setup: Pre-seed test user via API', async () => {
      const response = await apiHelper.createAccount(userData);
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

    await test.step('Fill credentials and submit login form', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step('Verify active session with the correct username', async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step('Teardown: Delete account and verify confirmation', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```

---

## Reference Guides & Architecture

Explore the specialized documentation included in the repository:
- [Global Auth & Storage State Persistence (`docs/auth-setup.md`)](docs/auth-setup.md)
- [Structured Logging Architecture (`docs/logging.md`)](docs/logging.md)
- [Declarative Test Steps Guide (`test.step`)](.agents/skills/playwright-automation/references/test-steps.md)
- [POM, Components & Fixtures Architecture](.agents/skills/playwright-automation/references/architecture-pom.md)
- [Dynamic Test Data & API Helpers](.agents/skills/playwright-automation/references/test-data-and-api.md)
- [Locators Strategy & Web-First Assertions](.agents/skills/playwright-automation/references/locators-and-assertions.md)
- [Universal AI Agent Guidelines (`AGENTS.md`)](AGENTS.md)
