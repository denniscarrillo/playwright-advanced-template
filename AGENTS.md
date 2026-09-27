# Agent Guidelines & Playwright Architecture (`AGENTS.md`)

This file contains universal instructions, coding standards, and architectural rules for any AI agent or developer working on this Playwright test automation repository.

---

## 1. Project Architecture & Standards

- **Language & Framework**: TypeScript with `@playwright/test`.
- **Design Pattern**: Page Object Model (POM) + Component Object Model.
- **Fixture Injection**: All Page Objects, Components, and API Controllers must be provided through custom fixtures in [`src/fixtures/pages.fixture.ts`](src/fixtures/pages.fixture.ts).
- **Environment Management**: Environment variables validated via Zod schemas in [`env.config.ts`](env.config.ts) and loaded from `.env.<env>`.

---

## 2. Mandatory Rules for Authoring Tests

### Rule 1: Always Use Declarative `test.step()`
- Every test specification **must** organize actions and assertions into `await test.step('Description', async () => { ... })` blocks.
- Step descriptions and comments **must be in English** and reflect clear business steps / user actions (e.g. `'Navigate to home page'`, `'Log in with valid credentials'`).
- **Do not prefix steps with numbers** (avoid `'1. Navigate...'`, `'2. Click...'`); Playwright reports and traces automatically handle sequential ordering.
- Group the relevant action and its expected verification together in the same step.
- See detailed guide: [Declarative Steps Reference](.agents/skills/playwright-automation/references/test-steps.md).

### Rule 2: Page Object & Component Hierarchy
- Pages representing full views must inherit from [`BasePage`](src/pages/base.page.ts) in `src/pages/`.
- Reusable page sections (Header, Navigation, Modals) must be encapsulated in `src/pages/components/`.
- API testing and preconditioning must be encapsulated in domain controllers under `src/helpers/api/controllers/` (inheriting from [`BaseApi`](src/helpers/api/base.api.ts)).
- Never instantiate Page Objects or API Controllers directly with `new MyPage(page)` inside test files; always use the extended fixture from `@/fixtures/pages.fixture` or `@/fixtures/api.fixture`.
- See detailed guide: [Architecture & POM Reference](.agents/skills/playwright-automation/references/architecture-pom.md).

### Rule 3: Dynamic Test Data & API Preconditions
- Never use shared static credentials for destructive actions (e.g., account deletion).
- Generate isolated test data per test run using [`generateRandomRegistrationData()`](src/utils/generator.util.ts).
- Prefer pre-seeding state or teardown via API controllers ([`AuthApi`](src/helpers/api/controllers/auth.api.ts)) to keep tests fast and isolated.
- See detailed guide: [Test Data & API Reference](.agents/skills/playwright-automation/references/test-data-and-api.md).

### Rule 4: Resilient Locators & Web-First Assertions
- Prioritize user-facing locators (`getByRole`, `getByLabel`, `getByText`) or explicit test attributes (`locator('[data-qa="..."]')`).
- Avoid strict mode violations (e.g., ensure locators match exactly 1 target element).
- Always use auto-retrying web-first assertions (`await expect(locator).toBeVisible()`) instead of manual waits or boolean evaluation.
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
- Organize tests inside domain/feature folders under `tests/e2e/<feature>/` (e.g., `tests/e2e/auth/`, `tests/e2e/products/`, `tests/e2e/checkout/`).
- Group closely related test scenarios inside the same `.spec.ts` file under a common `test.describe('Feature: ...')` block.
- **Maximum 4 test cases per `.spec.ts` file** to maintain balanced parallel execution workers and clean file readability. If a feature exceeds 4 tests, split into sub-topic spec files (e.g., `signup.spec.ts`, `login.spec.ts`).


---

## 3. Reference Documentation Index

When detailed guidance on a specific subsystem is needed, refer to the corresponding reference document:

- **Structured Logging**: [`docs/logging.md`](docs/logging.md)
- **Declarative Steps**: [`.agents/skills/playwright-automation/references/test-steps.md`](.agents/skills/playwright-automation/references/test-steps.md)
- **POM, Components & Fixtures**: [`.agents/skills/playwright-automation/references/architecture-pom.md`](.agents/skills/playwright-automation/references/architecture-pom.md)
- **Data Generation & API**: [`.agents/skills/playwright-automation/references/test-data-and-api.md`](.agents/skills/playwright-automation/references/test-data-and-api.md)
- **Locators & Assertions**: [`.agents/skills/playwright-automation/references/locators-and-assertions.md`](.agents/skills/playwright-automation/references/locators-and-assertions.md)

---

## 4. Useful Commands

```bash
# Run all tests
pnpm test

# Run tests in UI mode
pnpm test:ui

# Run specific test file
npx playwright test tests/e2e/login.spec.ts

# Open HTML report
pnpm report
```
