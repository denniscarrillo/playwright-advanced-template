import { authTest, type AuthOptions } from '@/fixtures/auth.fixture';
import { LoginPage } from '@/pages/login.page';
import { SignupPage } from '@/pages/signup.page';
import { AccountStatusPage } from '@/pages/account-status.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ApiHelper } from '@/helpers/api.helper';
import { createLogger, type Logger } from '@/utils/logger.util';

export interface CustomFixtures {
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
  header: HeaderComponent;
  apiHelper: ApiHelper;
  logger: Logger;
}

export const test = authTest.extend<CustomFixtures>({
  logger: async ({}, use, testInfo) => {
    const testLogger = createLogger(`${testInfo.project.name} › ${testInfo.title}`);
    await use(testLogger);
  },

  loginPage: async ({ page }, use: (loginPage: LoginPage) => Promise<void>) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  signupPage: async ({ page }, use: (signupPage: SignupPage) => Promise<void>) => {
    const signupPage = new SignupPage(page);
    await use(signupPage);
  },

  accountStatusPage: async ({ page }, use: (accountStatusPage: AccountStatusPage) => Promise<void>) => {
    const accountStatusPage = new AccountStatusPage(page);
    await use(accountStatusPage);
  },

  header: async ({ page }, use: (header: HeaderComponent) => Promise<void>) => {
    const header = new HeaderComponent(page);
    await use(header);
  },

  apiHelper: async ({ request }, use: (apiHelper: ApiHelper) => Promise<void>) => {
    const apiHelper = new ApiHelper(request);
    await use(apiHelper);
  },
});

export { expect } from '@playwright/test';
export { logger } from '@/utils/logger.util';

