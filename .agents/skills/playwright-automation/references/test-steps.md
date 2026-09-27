# Declarative Test Steps (`test.step()`)

Organizing tests into descriptive `test.step()` blocks improves code readability, reporting, trace debugging, and alignment with business requirements.

---

## 1. Core Principles

1. **Declarative Step Descriptions in English**:
   - Focus on user intent and business actions, not technical implementation details.
   - Good: `await test.step('Log in with valid credentials', async () => { ... })`
   - Bad: `await test.step('Fill inputs and click submit', async () => { ... })`

2. **No Numeric Prefixes (Do Not Enumerate Steps)**:
   - Do NOT prefix step titles with numbers (e.g., avoid `'1. Navigate...'`, `'2. Verify...'`).
   - Playwright's test runner, HTML reports, and trace viewer already order, index, and track step execution sequentially.
   - Unnumbered steps make tests cleaner, more maintainable, and easier to reorder or refactor without renumbering.

3. **Atomic Steps with Assertions**:
   - Group the relevant action and its expected immediate verification in the same step.

4. **Dedicated Data Setup / Teardown Steps**:
   - Clearly delineate API seed calls, authentication setup, or cleanup teardowns (e.g. `'Setup: Create test user via API'`, `'Teardown: Delete account'`).

---

## 2. Standard Pattern & Example

```typescript
import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case X: Feature Title', () => {
  test('should complete the flow successfully with declarative steps', async ({
    page,
    loginPage,
    header,
    accountStatusPage,
    apiHelper,
  }) => {
    const userData = generateRandomRegistrationData('test_user');

    // Data Setup (Precondition)
    await test.step('Setup: Create test user via API', async () => {
      const response = await apiHelper.createAccount(userData);
      expect(response.status()).toBe(200);
    });

    // Navigation
    await test.step('Navigate to home page and verify visibility', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    // Menu Interaction
    await test.step("Click on 'Signup / Login' button", async () => {
      await header.goToSignupLogin();
      await expect(loginPage.loginHeading).toBeVisible();
    });

    // Primary Action
    await test.step('Log in with user credentials', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    // Verification
    await test.step('Verify that session is active with correct user', async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    // Teardown / Cleanup
    await test.step('Teardown: Delete account', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```

---

## 3. Benefits in Playwright Reports & Tracing

- **HTML Report**: Generates expandable step-by-step trees showing timing for each logical phase.
- **Trace Viewer**: Groups network requests, console logs, and DOM snapshots under the specific step where they happened.
- **Fast Triaging**: Instant visibility into which business step failed without reading raw line numbers.
