import { test, expect } from '@/fixtures/pages.fixture';

test.describe('Test Case 3: Authenticated Session with Persistent Storage State', () => {
  // useAuth: true is enabled by default
  
  test('should load home page with pre-authenticated session active', async ({
    page,
    header,
    logger,
  }) => {
    logger.info('Verifying that pre-authenticated global session is active');

    await test.step('Navigate to home page with injected authentication cookies', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Verify that 'Logged in as' header is visible without manual login", async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.logoutLink).toBeVisible();
      logger.info('User session successfully recognized via storageState cookies');
    });
  });
});
