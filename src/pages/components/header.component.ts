import { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly navBar: Locator;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.navBar = page.locator('header, nav');
    this.userMenuButton = page.getByRole('button', { name: /user|perfil|account/i });
    this.logoutButton = page.getByRole('button', { name: /log\s?out|cerrar sesión/i });
  }

  async logout(): Promise<void> {
    await this.userMenuButton.click();
    await this.logoutButton.click();
  }
}
