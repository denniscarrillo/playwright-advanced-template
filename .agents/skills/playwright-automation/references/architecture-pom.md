# Page Object Model (POM), Components & Fixtures Architecture

This document describes the architectural standards and separation of concerns used across this test automation framework.

---

## 1. Directory Structure

```text
src/
├── pages/                   # Page Objects representing full pages / views
│   ├── base.page.ts         # Abstract BasePage with shared methods (navigate, getTitle, getUrl)
│   ├── login.page.ts        # Page Object for Login & initial signup form
│   ├── signup.page.ts       # Page Object for Registration details form
│   ├── account-status.page.ts # Page Object for confirmation states (created, deleted)
│   └── components/          # Reusable UI widgets / navigation across multiple pages
│       └── header.component.ts # Main navigation header
├── fixtures/                # Custom Playwright fixtures
│   └── base.fixture.ts      # Merges all Page Objects, Components and Helpers into `test`
├── helpers/                 # API client and backend interaction helpers
│   └── api.helper.ts        # API requests and data seeding/teardown
├── utils/                   # Pure utility functions (generators, formatters)
│   ├── generator.util.ts    # Fake / dynamic test data generator
│   └── date.util.ts         # Date manipulation helpers
├── data/                    # Static data & route constants
│   └── constants/routes.ts  # Endpoint and path definitions
└── types/                   # TypeScript interfaces and types
    └── user.types.ts        # User credentials and registration models
```

---

## 2. BasePage Design

All page classes should inherit from [`BasePage`](src/pages/base.page.ts):

```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path = ''): Promise<void> {
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

## 4. Custom Fixtures (`base.fixture.ts`)

Instead of instantiating Page Objects inside every test file (`new LoginPage(page)`), extend Playwright's base test with fixtures. This enables dependency injection and automatic lifecycle management:

```typescript
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ApiHelper } from '@/helpers/api.helper';

export interface CustomFixtures {
  loginPage: LoginPage;
  header: HeaderComponent;
  apiHelper: ApiHelper;
}

export const test = baseTest.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  apiHelper: async ({ request }, use) => {
    await use(new ApiHelper(request));
  },
});

export { expect } from '@playwright/test';
```
