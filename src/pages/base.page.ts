import { Page } from '@playwright/test';
import { createLogger, type Logger } from '@/utils/logger.util';

export abstract class BasePage {
  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.logger = createLogger(this.constructor.name);
  }

  /**
   * Navigates to a path relative to the baseURL.
   */
  async navigate(path = ''): Promise<void> {
    this.logger.info(`Navigating to: ${path || '/'}`);
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
