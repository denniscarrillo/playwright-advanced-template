import { test as baseTest } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { ApiHelper } from '@/helpers/api.helper';

export interface CustomFixtures {
  loginPage: LoginPage;
  apiHelper: ApiHelper;
}

export const test = baseTest.extend<CustomFixtures>({
  loginPage: async ({ page }, use: (loginPage: LoginPage) => Promise<void>) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  apiHelper: async ({ request }, use: (apiHelper: ApiHelper) => Promise<void>) => {
    const apiHelper = new ApiHelper(request);
    await use(apiHelper);
  },
});

export { expect } from '@playwright/test';
