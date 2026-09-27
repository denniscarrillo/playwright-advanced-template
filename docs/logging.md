# Structured Logging Architecture (`docs/logging.md`)

This document outlines the logging strategy and architecture implemented in this repository using **Winston** and **Winston Daily Rotate File**, tailored for **Playwright multi-process parallel test execution**.

---

## 1. Overview & Core Philosophy

Instead of relying on unformatted and blocking `console.log()` statements, the repository utilizes a structured, asynchronous, and rotating logger located in [`src/utils/logger.util.ts`](../src/utils/logger.util.ts).

### Key Highlights
- **Process-Safe Worker Isolation**: Dedicated file streams per Playwright worker process to eliminate file-lock collisions, race conditions, and corrupted log lines during parallel test runs.
- **Context-Aware Formatting**: Every log line automatically includes a timestamp, log level, worker tag (`[W#0]`, `[W#1]`), and context origin (`[Project › Test]`, `[LoginPage]`, `[ApiHelper]`).
- **Daily Log Rotation & Retention**: Automatic daily file rotation with retention limits to prevent unbounded disk usage.
- **Dynamic Log Levels**: Easily toggled between `debug`, `info`, `warn`, and `error` via environment variables.

---

## 2. File Organization & Storage

All generated log files are stored under the root `logs/` directory (which is ignored by Git):

```text
logs/
├── workers/
│   ├── worker-0-YYYY-MM-DD.log    # Complete execution log for Worker #0 (Chromium, etc.)
│   ├── worker-1-YYYY-MM-DD.log    # Complete execution log for Worker #1
│   └── worker-N-YYYY-MM-DD.log    # Complete execution log for Worker #N
└── errors/
    ├── error-worker-0-YYYY-MM-DD.log # Errors only for Worker #0
    └── error-worker-N-YYYY-MM-DD.log # Errors only for Worker #N
```

### Retention Policies
- **Worker Execution Logs (`logs/workers/`)**: Retained for **14 days** with automatic `.gz` compression on rotation (`maxFiles: '14d'`, `maxSize: '20m'`).
- **Error Logs (`logs/errors/`)**: Retained for **30 days** (`maxFiles: '30d'`, `maxSize: '20m'`) for failure trend analysis and CI/CD triaging.

---

## 3. Log Formatting Standard

Each log entry is formatted with the following structure:

```text
YYYY-MM-DD HH:mm:ss [LEVEL] [WORKER] [CONTEXT]: Message
```

### Example Output

```text
2026-09-27 10:45:44 [info] [W#0] [chromium › should successfully log in with valid credentials]: Creating test user: login_user_cl2xgwe@example.com
2026-09-27 10:45:44 [info] [W#0] [ApiHelper]: Sending API request to create account: login_user_cl2xgwe@example.com
2026-09-27 10:45:45 [info] [W#0] [ApiHelper]: Account created successfully via API [status: 200]
2026-09-27 10:45:47 [info] [W#0] [HeaderComponent]: Clicking on 'Signup / Login' header link
2026-09-27 10:45:53 [info] [W#0] [LoginPage]: Filling login form with email: login_user_cl2xgwe@example.com
2026-09-27 10:45:55 [info] [W#0] [HeaderComponent]: Clicking on 'Delete Account' header link
```

---

## 4. Usage Patterns Across the Architecture

### A. Inside Test Specifications (`tests/**/*.spec.ts`)
Inject the `logger` fixture directly from `@/fixtures/base.fixture`. It automatically tags log entries with the active Playwright project and test name:

```typescript
import { test, expect } from '@/fixtures/base.fixture';

test('should complete checkout', async ({ cartPage, logger }) => {
  logger.info('Starting checkout validation flow');
  logger.debug('Cart state verification');
});
```

---

### B. Inside Page Objects (`src/pages/*.page.ts`)
[`BasePage`](../src/pages/base.page.ts) automatically initializes `this.logger` tagged with the derived class name (`this.constructor.name`):

```typescript
import { BasePage } from '@/pages/base.page';

export class LoginPage extends BasePage {
  async login({ email, password }: UserCredentials): Promise<void> {
    this.logger.info(`Filling login credentials for: ${email}`);
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
    this.logger.debug('Login button clicked');
  }
}
```

---

### C. Inside Reusable Components (`src/pages/components/*.ts`)
Instantiate a scoped child logger using `createLogger`:

```typescript
import { createLogger, type Logger } from '@/utils/logger.util';

export class HeaderComponent {
  private readonly logger: Logger = createLogger('HeaderComponent');

  async goToSignupLogin(): Promise<void> {
    this.logger.info("Clicking on 'Signup / Login' link");
    await this.signupLoginLink.click();
  }
}
```

---

### D. Inside API Helpers & Backend Clients (`src/helpers/*.ts`)
Log HTTP endpoints, payloads, status codes, and error bodies:

```typescript
import { createLogger, type Logger } from '@/utils/logger.util';

export class ApiHelper {
  private readonly logger: Logger = createLogger('ApiHelper');

  async createAccount(userData: UserRegistrationData): Promise<APIResponse> {
    this.logger.info(`Sending API request to create account: ${userData.email}`);
    const response = await this.request.post('/api/createAccount', { form: userData });

    if (response.ok()) {
      this.logger.info(`Account created successfully [status: ${response.status()}]`);
    } else {
      this.logger.error(`Account creation failed [status: ${response.status()}]`);
    }
    return response;
  }
}
```

---

### E. Inside Utility Functions (`src/utils/*.ts`)
For non-class pure utility functions:

```typescript
import { createLogger, type Logger } from '@/utils/logger.util';

const logger: Logger = createLogger('GeneratorUtil');

export function generateRandomRegistrationData(prefix = 'qa_user') {
  const data = { ... };
  logger.debug(`Generated random test data for: ${data.email}`);
  return data;
}
```

---

## 5. Configuration & Environment Variables

The logging level is controlled dynamically via [`env.config.ts`](../env.config.ts) and `.env.<environment>` files:

```ini
# .env.qa / .env.dev
LOG_LEVEL=info # Options: 'debug' | 'info' | 'warn' | 'error'
```

To run a test with verbose debug logs on the fly:
```bash
LOG_LEVEL=debug pnpm test
```
