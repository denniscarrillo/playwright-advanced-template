import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import { AUTH_STORAGE_PATH } from '@/data/constants/auth';
import { createLogger } from '@/utils/logger.util';

const logger = createLogger('AuthFixture');

export interface AuthOptions {
  /**
   * Whether to inject global authentication cookies and storage state.
   * Default: true. Set to false for guest/unauthenticated flows.
   */
  useAuth: boolean;
}

export const authTest = baseTest.extend<AuthOptions>({
  useAuth: [true, { option: true }],

  context: async ({ browser, useAuth }, use) => {
    let storageState: string | undefined = undefined;

    if (useAuth) {
      if (!fs.existsSync(AUTH_STORAGE_PATH)) {
        logger.error(`Storage state file missing at: ${AUTH_STORAGE_PATH}`);
        throw new Error(
          `[Fast-Fail Auth Error] Storage state file not found at "${AUTH_STORAGE_PATH}". ` +
          `Ensure global-setup has run or that valid session credentials exist before running authenticated tests.`
        );
      }
      logger.debug(`Injecting global authenticated storageState from: ${AUTH_STORAGE_PATH}`);
      storageState = AUTH_STORAGE_PATH;
    } else {
      logger.debug('useAuth is false - Running with a clean unauthenticated context');
    }

    const context = await browser.newContext({
      storageState,
    });

    await use(context);
    await context.close();
  },
});
