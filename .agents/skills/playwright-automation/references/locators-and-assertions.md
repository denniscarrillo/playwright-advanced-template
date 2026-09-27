# Locator Strategy & Web-First Assertions

Follow Playwright's locator and assertion best practices to write resilient, flake-free tests.

---

## 1. Locator Priority Strategy

Choose locators that resemble how real users interact with the page:

1. **User-Facing Roles & Text**:
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByRole('heading', { name: 'Login to your account' })`
   - `page.getByText('Logged in as')`
2. **Explicit Test Attributes**:
   - `page.locator('[data-qa="login-email"]')`
   - `page.locator('[data-qa="account-created"]')`
3. **Labels & Placeholders**:
   - `page.getByLabel('Password')`
   - `page.getByPlaceholder('Email Address')`
4. **CSS Selectors (Fallbacks)**:
   - Use unique IDs or unambiguous selectors: `page.locator('#header')`.
   - Avoid brittle XPath or deeply nested DOM paths (`div > div:nth-child(3) > span`).

---

## 2. Avoiding Strict Mode Violations

Playwright enforces **strict mode** on locators: if a locator matches more than one element, actions and single-element assertions will fail.

- **Bad**: `page.locator('header#header, .shop-menu')` (matches 2 elements).
- **Good**: `page.locator('#header')` or `page.locator('#header .shop-menu')`.
- If multiple elements are intended, explicitly narrow down:
  - `locator.first()`
  - `locator.nth(0)`
  - `locator.filter({ hasText: 'Item Name' })`

---

## 3. Web-First Assertions

Always use Playwright's auto-retrying assertions (`expect(locator).to...`) instead of manual waits or checking boolean flags:

```typescript
// Good: Auto-retries until timeout
await expect(loginPage.loginHeading).toBeVisible();
await expect(header.loggedInUserText).toContainText('Dennis');
await expect(signupPage.nameInput).toHaveValue('Dennis');

// Bad: No auto-retry, causes race conditions
const isVisible = await loginPage.loginHeading.isVisible();
expect(isVisible).toBe(true);
```
