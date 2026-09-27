import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigates to a path relative to the baseURL.
   */
  async navigate(path = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Returns current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Returns current page URL.
   */
  getUrl(): string {
    return this.page.url();
  }
}
