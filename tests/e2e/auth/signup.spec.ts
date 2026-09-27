import { test, expect } from '@/fixtures/pages.fixture';
import env from '@/../env.config';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Feature: User Registration (Signup)', () => {
  // Guest flows: Run without pre-authenticated session cookies
  test.use({ useAuth: false });

  test('Test Case 2: Register a new user and verify account creation', async ({
    loginPage,
    signupPage,
    accountStatusPage,
    header,
    logger,
  }) => {
    const userData = generateRandomRegistrationData('qa_user');
    logger.info(`Starting registration test for user: ${userData.email}`);

    await test.step('Navigate to login / signup page and verify visibility', async () => {
      await loginPage.open();
      await expect(loginPage.signupHeading).toBeVisible();
    });

    await test.step('Initiate signup process with name and email address', async () => {
      await loginPage.initiateSignup(userData.name, userData.email);
    });

    await test.step('Verify that account information screen is displayed', async () => {
      await expect(signupPage.accountInfoHeading).toBeVisible();
      await expect(signupPage.nameInput).toHaveValue(userData.name);
      await expect(signupPage.emailInput).toHaveValue(userData.email);
    });

    await test.step('Complete account and address information form', async () => {
      await signupPage.completeRegistration(userData);
    });

    await test.step('Verify account created confirmation and continue', async () => {
      await expect(accountStatusPage.accountCreatedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });

    await test.step('Verify logged-in state with user name', async () => {
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step('Teardown: Delete account for cleanup', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });

  test('Test Case 5: Show error message when registering with an existing email', async ({
    page,
    header,
    loginPage,
    logger,
  }) => {
    const existingEmail = env.LOGIN_USER;
    const userName = 'Registered User';

    logger.info(`Testing registration rejection with existing email: ${existingEmail}`);

    await test.step('Navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('Verify that home page is visible successfully', async () => {
      await expect(page).toHaveTitle(/Automation Exercise/);
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Click on 'Signup / Login' button", async () => {
      await header.goToSignupLogin();
    });

    await test.step("Verify 'New User Signup!' is visible", async () => {
      await expect(loginPage.signupHeading).toBeVisible();
    });

    await test.step("Enter name and already registered email address and click 'Signup' button", async () => {
      await loginPage.initiateSignup(userName, existingEmail);
    });

    await test.step("Verify error 'Email Address already exist!' is visible", async () => {
      await expect(loginPage.signupErrorMessage).toBeVisible();
      await expect(loginPage.signupErrorMessage).toContainText('Email Address already exist!');
      logger.info('Duplicate email registration error displayed as expected');
    });
  });
});
