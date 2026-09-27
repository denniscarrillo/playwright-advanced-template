import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomUser } from '@/utils/generator.util';

test.describe('Autenticación', () => {
  test('debe interactuar con la página de login usando fixtures y utils', async ({ loginPage }) => {
    const randomUser = generateRandomUser('qa_tester');

    await loginPage.open();
    await expect(loginPage.emailInput).toBeVisible();

    await loginPage.login(randomUser);
  });
});
