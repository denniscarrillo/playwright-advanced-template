import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case 1: Login User with correct email and password', () => {
  test('should successfully log in with valid credentials and delete account', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    apiHelper,
    logger,
  }) => {
    const userData = generateRandomRegistrationData('login_user');

    await test.step('Setup: Create test user via API', async () => {
      logger.info(`Creating test user: ${userData.email}`);
      const response = await apiHelper.createAccount(userData);
      expect(response.status()).toBe(200);
      logger.info(`Test user created successfully via API`);
    });

    await test.step('Navigate to Automation Exercise home page', async () => {
      await page.goto('/');
    });

    await test.step('Verify that home page is visible successfully', async () => {
      await expect(page).toHaveTitle(/Automation Exercise/);
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Click on 'Signup / Login' button", async () => {
      await header.goToSignupLogin();
    });

    await test.step("Verify 'Login to your account' is visible", async () => {
      await expect(loginPage.loginHeading).toBeVisible();
    });

    await test.step('Enter correct email address and password and click login button', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step("Verify that 'Logged in as username' is visible with user name", async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step("Click 'Delete Account' button", async () => {
      await header.deleteAccount();
    });

    await test.step("Verify that 'ACCOUNT DELETED!' is visible and continue", async () => {
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});

