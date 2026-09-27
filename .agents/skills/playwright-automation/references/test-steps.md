# Declarative Test Steps (`test.step()`)

Organizing tests into descriptive `test.step()` blocks improves code readability, reporting, trace debugging, and alignment with business requirements.

---

## 1. Core Principles

1. **Declarative Step Descriptions**:
   - Focus on user intent and business actions, not technical implementation details.
   - Good: `await test.step('1. Iniciar sesión con credenciales válidas', async () => { ... })`
   - Bad: `await test.step('Llenar inputs y presionar submit', async () => { ... })`

2. **Step Numbering**:
   - Prefix steps with their test case numbering when automating specified test cases (e.g. `'1. Navegar a la URL...'`, `'2. Validar que la pantalla principal cargó...'`).

3. **Atomic Steps with Assertions**:
   - Group the relevant action and its expected immediate verification in the same step.

4. **Dedicated Data Setup / Teardown Steps**:
   - Clearly delineate API seed calls, authentication setup, or cleanup teardowns.

---

## 2. Standard Pattern & Example

```typescript
import { test, expect } from '@/fixtures/base.fixture';
import { generateRandomRegistrationData } from '@/utils/generator.util';

test.describe('Test Case X: Feature Title', () => {
  test('debe completar el flujo exitosamente con pasos declarativos', async ({
    page,
    loginPage,
    header,
    accountStatusPage,
    apiHelper,
  }) => {
    const userData = generateRandomRegistrationData('test_user');

    // 0. Preparación de datos (Precondición)
    await test.step('Preparación: Registrar usuario vía API para la prueba', async () => {
      const response = await apiHelper.createAccount(userData);
      expect(response.status()).toBe(200);
    });

    // 1. Navegación
    await test.step('1. Navegar a la página principal', async () => {
      await page.goto('/');
      await expect(header.navBar).toBeVisible();
    });

    // 2. Interacción con el menú
    await test.step("2. Hacer clic en 'Signup / Login'", async () => {
      await header.goToSignupLogin();
      await expect(loginPage.loginHeading).toBeVisible();
    });

    // 3. Ejecución de la acción principal
    await test.step('3. Ingresar credenciales y realizar login', async () => {
      await loginPage.login({
        email: userData.email,
        password: userData.password,
      });
    });

    // 4. Verificación de resultado
    await test.step("4. Validar que la sesión se encuentra activa con el usuario correcto", async () => {
      await expect(header.loggedInUserText).toBeVisible();
      await expect(header.loggedInUserText).toContainText(userData.name);
    });

    // 5. Teardown / Limpieza
    await test.step("5. Eliminar la cuenta para limpieza", async () => {
      await header.deleteAccount();
      await expect(accountStatusPage.accountDeletedHeading).toBeVisible();
      await accountStatusPage.clickContinue();
    });
  });
});
```

---

## 3. Benefits in Playwright Reports & Tracing

- **HTML Report**: Generates expandable step-by-step trees showing timing for each logical phase.
- **Trace Viewer**: Groups network requests, console logs, and DOM snapshots under the specific step where they happened.
- **Fast Triaging**: Instant visibility into which business step failed without reading raw line numbers.
