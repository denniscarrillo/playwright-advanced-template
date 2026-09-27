import { Locator, Page } from '@playwright/test';
import { createLogger, type Logger } from '@/utils/logger.util';

export class HeaderComponent {
  private readonly logger: Logger = createLogger('HeaderComponent');

  readonly navBar: Locator;
  readonly homeLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInUserText: Locator;

  constructor(private readonly page: Page) {
    this.navBar = page.locator('#header');
    this.homeLink = page.getByRole('link', { name: /home/i });
    this.signupLoginLink = page.getByRole('link', { name: /signup\s?\/\s?login/i });
    this.logoutLink = page.getByRole('link', { name: /logout/i });
    this.deleteAccountLink = page.getByRole('link', { name: /delete account/i });
    this.loggedInUserText = page.getByText(/logged in as/i);
  }

  async goToSignupLogin(): Promise<void> {
    this.logger.info("Clicking on 'Signup / Login' header link");
    await this.signupLoginLink.click();
  }

  async logout(): Promise<void> {
    this.logger.info("Clicking on 'Logout' header link");
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    this.logger.info("Clicking on 'Delete Account' header link");
    await this.deleteAccountLink.click();
  }
}
