import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ROUTES } from '@/data/constants/routes';
import { UserCredentials } from '@/types/user.types';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.emailInput = page.getByLabel(/email|usuario/i).or(page.locator('input[type="email"], input[name="username"]'));
    this.passwordInput = page.getByLabel(/password|contraseña/i).or(page.locator('input[type="password"]'));
    this.submitButton = page.getByRole('button', { name: /log\s?in|iniciar sesión|sign in/i });
    this.errorMessage = page.locator('.error-message, [role="alert"]');
  }

  async open(): Promise<void> {
    await this.navigate(ROUTES.LOGIN);
  }

  async login({ email, password }: UserCredentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
