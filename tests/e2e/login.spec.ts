import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case 2: Login User with correct email and password', () => {
  test('debe iniciar sesión exitosamente con credenciales válidas y eliminar la cuenta', async ({
    page,
    header,
    loginPage,
    accountStatusPage,
    apiHelper,
  }) => {
    const userData = generateRandomRegistrationData('login_user');

    await test.step('Preparación: Crear usuario de prueba vía API', async () => {
      const response = await apiHelper.createAccount(userData);
      expect(response.status()).toBe(200);
    });

    await test.step('1 & 2. Navegar a la página principal de Automation Exercise', async () => {
      await page.goto('/');
    });

    await test.step('3. Verificar que la página principal se visualiza correctamente', async () => {
      await expect(page).toHaveTitle(/Automation Exercise/);
      await expect(header.navBar).toBeVisible();
    });

    await test.step("4. Hacer clic en el botón 'Signup / Login'", async () => {
      await header.goToSignupLogin();
    });

    await test.step("5. Verificar que 'Login to your account' está visible", async () => {
      await expect(loginPage.loginHeading).toBeVisible();
    });

    await test.step('6 & 7. Ingresar email y password correctos y hacer clic en el botón de login', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    await test.step("8. Verificar que 'Logged in as username' está visible con el nombre del usuario", async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step("9. Hacer clic en el botón 'Delete Account'", async () => {
      await header.deleteAccount();
    });

    await test.step("10. Verificar que 'ACCOUNT DELETED!' es visible y continuar", async () => {
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});

