import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Flujo de Registro (Signup) en Automation Exercise', () => {
  test('debe registrar un nuevo usuario y verificar la creación de la cuenta', async ({
    loginPage,
    signupPage,
    accountStatusPage,
    header,
  }) => {
    const userData = generateRandomRegistrationData('qa_user');

    await test.step('1. Navegar a la página de login / signup y verificar visibilidad', async () => {
      await loginPage.open();
      await expect(loginPage.signupHeading).toBeVisible();
    });

    await test.step('2. Iniciar el proceso de signup con nombre y correo electrónico', async () => {
      await loginPage.initiateSignup(userData.name, userData.email);
    });

    await test.step('3. Verificar que se cargó la pantalla de información de cuenta', async () => {
      await expect(signupPage.accountInfoHeading).toBeVisible();
      await expect(signupPage.nameInput).toHaveValue(userData.name);
      await expect(signupPage.emailInput).toHaveValue(userData.email);
    });

    await test.step('4. Completar el formulario de cuenta y dirección', async () => {
      await signupPage.completeRegistration(userData);
    });

    await test.step('5. Verificar confirmación de cuenta creada y continuar', async () => {
      await expect(accountStatusPage.accountCreatedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });

    await test.step('6. Verificar que la sesión está iniciada con el nombre del usuario', async () => {
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    await test.step('7. Eliminar la cuenta para limpieza (Teardown)', async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
