# Agent Guidelines & Playwright Architecture (`AGENTS.md`)

This file contains universal instructions, coding standards, and architectural rules for any AI agent or developer working on this Playwright test automation repository.

---

## 1. Project Architecture & Standards

- **Language & Framework**: TypeScript with `@playwright/test`.
- **Design Patterns**:
  - **UI / E2E**: Page Object Model (POM) inheriting from [`BasePage`](src/pages/base.page.ts) + Component Object Model.
  - **API**: Controller Architecture inheriting from [`BaseApi`](src/helpers/api/base.api.ts) with endpoints mapped in [`src/data/constants/endpoints.ts`](src/data/constants/endpoints.ts).
- **Fixture Injection**:
  - UI E2E tests: Injected via [`src/fixtures/pages.fixture.ts`](src/fixtures/pages.fixture.ts) (Page Objects, Components, Logger, `authApi` for pre-seeding).
  - API tests: Injected via [`src/fixtures/api.fixture.ts`](src/fixtures/api.fixture.ts) (`baseURL: env.API_BASE_URL`, `authApi`, `productsApi`, `brandsApi`).
- **Environment Management**: Environment variables validated via strict Zod schemas in [`env.config.ts`](env.config.ts) loaded from `.env.<env>`. `BASE_URL` and `API_BASE_URL` are strictly required (no silent fallbacks).

---

## 2. Mandatory Rules for Authoring Tests

### Rule 1: Always Use Declarative `test.step()`
- Every test specification **must** organize actions and assertions into `await test.step('Description', async () => { ... })` blocks.
- Step descriptions and comments **must be in English** and reflect clear business steps / user actions (e.g. `'Navigate to home page'`, `'Send GET request for products list'`).
- **Do not prefix steps with numbers** (avoid `'1. Navigate...'`, `'2. Click...'`); Playwright reports and traces automatically handle sequential ordering.
- Group the relevant action and its expected verification together in the same step.
- See detailed guide: [Declarative Steps Reference](.agents/skills/playwright-automation/references/test-steps.md).

### Rule 2: Page Objects & API Controllers Hierarchy
- Pages representing full views must inherit from [`BasePage`](src/pages/base.page.ts) in `src/pages/`.
- Reusable page sections (Header, Navigation, Modals) must be encapsulated in `src/pages/components/`.
- API testing and preconditioning must be encapsulated in domain controllers under `src/helpers/api/controllers/` (inheriting from [`BaseApi`](src/helpers/api/base.api.ts)).
- **Never hardcode API endpoint URLs**: Always import and reference [`API_ENDPOINTS`](src/data/constants/endpoints.ts).
- **Never instantiate Page Objects or API Controllers directly** with `new MyPage(page)` or `new MyApi(request)` inside test files; always use the extended fixture from `@/fixtures/pages.fixture` or `@/fixtures/api.fixture`.
- See detailed guides: [POM & Fixtures Reference](.agents/skills/playwright-automation/references/architecture-pom.md) and [API Testing Reference](.agents/skills/playwright-automation/references/api-testing.md).

### Rule 3: Dynamic Test Data & State Clean Up
- Never use shared static credentials for destructive actions (e.g., account deletion).
- Generate isolated test data per test run using [`generateRandomRegistrationData()`](src/utils/generator.util.ts).
- Prefer pre-seeding state or teardown via API controllers ([`AuthApi`](src/helpers/api/controllers/auth.api.ts)) to keep tests fast and isolated.
- See detailed guide: [Test Data & API Reference](.agents/skills/playwright-automation/references/test-data-and-api.md).

### Rule 4: Resilient Locators & Web-First Assertions
- Prioritize user-facing locators (`getByRole`, `getByLabel`, `getByText`) or explicit test attributes (`locator('[data-qa="..."]')`).
- Avoid strict mode violations (e.g., ensure locators match exactly 1 target element).
- Always use auto-retrying web-first assertions (`await expect(locator).toBeVisible()`) instead of manual waits or boolean evaluation.
- For API tests, assert on both HTTP response status (`expect(res.status()).toBe(200)`) and body payload properties (`expect(data.responseCode).toBe(200)`).
- See detailed guide: [Locators & Assertions Reference](.agents/skills/playwright-automation/references/locators-and-assertions.md).

### Rule 5: Browser Inspection & Failure Debugging
- Whenever creating, updating, or debugging Page Objects and tests in environments supporting the [`playwright-cli`](.agents/skills/playwright-cli/SKILL.md) skill (e.g., Antigravity):
  - Open the target page using `playwright-cli open <url>`.
  - Capture and inspect the live DOM tree using `playwright-cli snapshot` or `playwright-cli find "<text>"`.
  - Validate selectors against the live DOM snapshot before adding them to Page Objects.
  - Close the inspection browser with `playwright-cli close`.
- In standard/headless environments, run tests with tracing enabled or inspect Playwright HTML reports/traces to diagnose errors before applying fixes.

### Rule 6: Feature Folder Organization & Test Grouping
- **Do not create a new `.spec.ts` file for every single test case.**
- Organize tests inside domain/feature folders:
  - E2E tests: under `tests/e2e/<feature>/` (e.g., `tests/e2e/auth/`, `tests/e2e/products/`, `tests/e2e/checkout/`).
  - API tests: under `tests/api/<feature>/` (e.g., `tests/api/auth/`, `tests/api/products/`, `tests/api/brands/`).
- Group closely related test scenarios inside the same `.spec.ts` file under a common `test.describe('...')` block.
- **Maximum 4 test cases per `.spec.ts` file** to maintain balanced parallel execution workers and clean file readability. If a feature exceeds 4 tests, split into sub-topic spec files (e.g., `signup.spec.ts`, `login.spec.ts`).

---

## 3. Reference Documentation Index

When detailed guidance on a specific subsystem is needed, refer to the corresponding reference document:

- **Enterprise Master Architecture Guide**: [`docs/architecture-guide.md`](docs/architecture-guide.md)
- **Structured Logging**: [`docs/logging.md`](docs/logging.md)
- **API Testing & Controllers**: [`.agents/skills/playwright-automation/references/api-testing.md`](.agents/skills/playwright-automation/references/api-testing.md)
- **Declarative Steps**: [`.agents/skills/playwright-automation/references/test-steps.md`](.agents/skills/playwright-automation/references/test-steps.md)
- **POM, Components & Fixtures**: [`.agents/skills/playwright-automation/references/architecture-pom.md`](.agents/skills/playwright-automation/references/architecture-pom.md)
- **Data Generation & API**: [`.agents/skills/playwright-automation/references/test-data-and-api.md`](.agents/skills/playwright-automation/references/test-data-and-api.md)
- **Locators & Assertions**: [`.agents/skills/playwright-automation/references/locators-and-assertions.md`](.agents/skills/playwright-automation/references/locators-and-assertions.md)

---

## 4. Useful Commands

```bash
# Run all tests (API + E2E)
pnpm test

# Run only API tests
pnpm exec playwright test tests/api/

# Run only E2E tests
pnpm exec playwright test tests/e2e/

# Run tests in UI mode
pnpm test:ui

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Open HTML report
pnpm report
```

