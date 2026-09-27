import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ROUTES } from '@/data/constants/routes';
import { UserCredentials } from '@/types/user.types';

export class LoginPage extends BasePage {
  readonly header: HeaderComponent;

  // Login Form
  readonly loginHeading: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  // Signup Form
  readonly signupHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    // Login Form Locators
    this.loginHeading = page.getByRole('heading', { name: 'Login to your account' });
    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.errorMessage = page.locator('.login-form p');

    // Signup Form Locators
    this.signupHeading = page.getByRole('heading', { name: 'New User Signup!' });
    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator('.signup-form p');
  }

  async open(): Promise<void> {
    await this.navigate(ROUTES.LOGIN);
  }

  async login({ email, password }: UserCredentials): Promise<void> {
    this.logger.info(`Filling login form with email: ${email}`);
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
    this.logger.debug('Login submit button clicked');
  }

  async initiateSignup(name: string, email: string): Promise<void> {
    this.logger.info(`Initiating signup for: "${name}" (${email})`);
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
    this.logger.debug('Signup submit button clicked');
  }
}
