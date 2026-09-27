import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case 2: Registration (Signup) flow on Automation Exercise', () => {
  test('should register a new user and verify account creation', async ({
    loginPage,
    signupPage,
    accountStatusPage,
    header,
  }) => {
    const userData = generateRandomRegistrationData('qa_user');

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
});
