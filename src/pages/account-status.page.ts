import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';

export class AccountStatusPage extends BasePage {
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountCreatedHeading = page.locator('[data-qa="account-created"]');
    this.accountDeletedHeading = page.locator('[data-qa="account-deleted"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
