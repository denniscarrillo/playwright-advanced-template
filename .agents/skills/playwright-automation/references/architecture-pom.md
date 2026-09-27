# Page Object Model (POM), Components & Fixtures Architecture

This document describes the architectural standards and separation of concerns used across this test automation framework.

---

## 1. Directory Structure

```text
src/
├── data/                    # Static data & route / endpoint constants
│   ├── constants/routes.ts  # Application URL routes
│   └── constants/endpoints.ts # Backend API endpoint definitions
├── fixtures/                # Custom Playwright fixtures
│   ├── api.fixture.ts       # Pure API fixtures (AuthApi, ProductsApi, BrandsApi, logger)
│   ├── auth.fixture.ts      # Authentication state & session persistence fixture
│   └── pages.fixture.ts     # UI Page Objects, Header Component & AuthApi for pre-seeding
├── helpers/                 # Backend API domain controllers & clients
│   └── api/
│       ├── base.api.ts      # Base HTTP client with logging & standard request methods
│       └── controllers/     # Domain API controllers (AuthApi, ProductsApi, BrandsApi)
├── pages/                   # Page Objects representing full pages / views
│   ├── base.page.ts         # Abstract BasePage with shared methods (navigate, getTitle, getUrl)
│   ├── login.page.ts        # Page Object for Login & initial signup form
│   ├── signup.page.ts       # Page Object for Registration details form
│   ├── account-status.page.ts # Page Object for confirmation states (created, deleted)
│   ├── products.page.ts     # Page Object for product catalog & detail pages
│   └── components/          # Reusable UI widgets / navigation across multiple pages
│       └── header.component.ts # Main navigation header
├── types/                   # TypeScript interfaces and types
│   ├── api.types.ts         # API response and payload models
│   └── user.types.ts        # User credentials and registration models
└── utils/                   # Pure utility functions (generators, logger, formatters)
    ├── date.util.ts         # Date manipulation helpers
    ├── generator.util.ts    # Fake / dynamic test data generator
    └── logger.util.ts       # Winston + Daily Rotate File structured logger
```

---

## 2. BasePage Design

All page classes should inherit from [`BasePage`](src/pages/base.page.ts):

```typescript
import { Page } from '@playwright/test';
import { Logger } from 'winston';
import { createScopedLogger } from '@/utils/logger.util';

export abstract class BasePage {
  protected readonly logger: Logger;

  constructor(
    protected readonly page: Page,
    loggerContext = 'BasePage',
  ) {
    this.logger = createScopedLogger(loggerContext);
  }

  async navigate(path = ''): Promise<void> {
    this.logger.info(`Navigating to: ${path || '/'}`);
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getUrl(): string {
    return this.page.url();
  }
}
```

---

## 3. Component Objects

When a section of the UI appears across multiple pages (e.g. Header, Footer, Sidebars, Modals), encapsulate it in `src/pages/components/` rather than duplicating locators in every Page Object.

```typescript
import { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly navBar: Locator;
  readonly homeLink: Locator;
  readonly signupLoginLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInUserText: Locator;

  constructor(private readonly page: Page) {
    this.navBar = page.locator('#header');
    this.homeLink = page.getByRole('link', { name: /home/i });
    this.signupLoginLink = page.getByRole('link', { name: /signup\s?\/\s?login/i });
    this.deleteAccountLink = page.getByRole('link', { name: /delete account/i });
    this.loggedInUserText = page.getByText(/logged in as/i);
  }

  async goToSignupLogin(): Promise<void> {
    await this.signupLoginLink.click();
  }
}
```

---

## 4. Custom Fixtures Separation

Instead of instantiating Page Objects inside every test file (`new LoginPage(page)`), extend Playwright's base test with modular fixtures. We maintain strict separation:

- [`src/fixtures/pages.fixture.ts`](src/fixtures/pages.fixture.ts): For UI E2E tests (injects Page Objects, Components, Logger, and `authApi` for fast preconditions).
- [`src/fixtures/api.fixture.ts`](src/fixtures/api.fixture.ts): For Pure API tests (injects `baseURL: env.API_BASE_URL`, `authApi`, `productsApi`, `brandsApi`).

```typescript
// src/fixtures/pages.fixture.ts
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { AuthApi } from '@/helpers/api/controllers/auth.api';

export interface CustomFixtures {
  loginPage: LoginPage;
  header: HeaderComponent;
  authApi: AuthApi;
}

export const test = baseTest.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },
});

export { expect } from '@playwright/test';
```
