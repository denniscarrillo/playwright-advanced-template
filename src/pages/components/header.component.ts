import { Locator, Page } from '@playwright/test';

export class HeaderComponent {
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
    await this.signupLoginLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }
}
