# Global Authentication & Storage State Architecture (`docs/auth-setup.md`)

This document outlines the authentication lifecycle, global setup, session persistence (`storageState`), and the `useAuth` fixture option implemented in this repository.

---

## 1. Overview & Architecture

To avoid repetitive and slow UI login sequences across hundreds of tests, this repository uses Playwright's **Global Setup** + **Storage State persistence** pattern.

```
┌────────────────────────────────────────┐
│      Global Setup (Runs 1x)            │
│  src/setup/global.setup.ts             │
│  - Authenticates via UI/API with       │
│    DEFAULT_USER & DEFAULT_PASSWORD     │
│  - Saves cookies to:                   │
│    playwright/.auth/user.json          │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│     Auth Fixture (src/fixtures/)       │
│     - useAuth: true (Default)          │
│       Injects storageState into context│
│       Fast-fails if file is missing    │
│     - useAuth: false                   │
│       Runs clean unauthenticated state │
└──────────────────┬─────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Authenticated │     │  Guest Tests  │
│ Test Specs    │     │  (useAuth: 0) │
└───────────────┘     └───────────────┘
```

---

## 2. Key Components

### A. Global Setup Script ([`src/setup/global.setup.ts`](../src/setup/global.setup.ts))
Configured in [`playwright.config.ts`](../playwright.config.ts) under `globalSetup`:
1. Ensures test user account exists via [`ApiHelper`](../src/helpers/api.helper.ts).
2. Logs in via [`LoginPage`](../src/pages/login.page.ts) with `env.DEFAULT_USER` and `env.DEFAULT_PASSWORD`.
3. Verifies active session with [`HeaderComponent`](../src/pages/components/header.component.ts).
4. Persists cookies, localStorage, and session tokens to [`AUTH_STORAGE_PATH`](../src/data/constants/auth.ts) (`playwright/.auth/user.json`).

### B. Auth Fixture & Fast-Fail ([`src/fixtures/auth.fixture.ts`](../src/fixtures/auth.fixture.ts))
Controls context creation per test:
- **`useAuth: true` (Default)**: Automatically attaches the pre-authenticated storage state.
- **Fast-Fail Mechanism**: If `useAuth: true` and `playwright/.auth/user.json` is missing or corrupted, the test immediately throws:
  ```text
  [Fast-Fail Auth Error] Storage state file not found at "playwright/.auth/user.json". Ensure global-setup has run or valid session credentials exist.
  ```
- **`useAuth: false`**: Spawns an isolated, clean browser context with no cookies.

---

## 3. Usage in Test Specifications

### Authenticated Tests (`useAuth: true` by default)
Tests do not need any login steps; they navigate directly to authenticated views:

```typescript
import { test, expect } from '@/fixtures/base.fixture';

test.describe('Authenticated User Features', () => {
  // useAuth: true is applied by default

  test('should access profile settings directly', async ({ page, header }) => {
    await page.goto('/');
    await expect(header.loggedInUserText).toBeVisible();
  });
});
```

### Guest / Unauthenticated Tests (`useAuth: false`)
For testing registration, landing page CTAs, or manual login forms:

```typescript
import { test, expect } from '@/fixtures/base.fixture';

test.describe('Visitor & Guest Flows', () => {
  // Disable session cookies for this describe block or test
  test.use({ useAuth: false });

  test('should display guest signup form', async ({ loginPage }) => {
    await loginPage.open();
    await expect(loginPage.loginHeading).toBeVisible();
  });
});
```
