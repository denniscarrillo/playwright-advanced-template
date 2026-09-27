import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { UserRegistrationData, UserAddress } from '@/types/user.types';

export class SignupPage extends BasePage {
  // Account Information Locators
  readonly accountInfoHeading: Locator;
  readonly genderMrRadio: Locator;
  readonly genderMrsRadio: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly daysSelect: Locator;
  readonly monthsSelect: Locator;
  readonly yearsSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;

  // Address Information Locators
  readonly addressInfoHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;

  // Submit Button
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);

    // Account Information
    this.accountInfoHeading = page.locator('.login-form h2.title', { hasText: 'Enter Account Information' });
    this.genderMrRadio = page.locator('#id_gender1');
    this.genderMrsRadio = page.locator('#id_gender2');
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.passwordInput = page.locator('[data-qa="password"]');
    this.daysSelect = page.locator('[data-qa="days"]');
    this.monthsSelect = page.locator('[data-qa="months"]');
    this.yearsSelect = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');

    // Address Information
    this.addressInfoHeading = page.locator('.login-form h2.title', { hasText: 'Address Information' });
    this.firstNameInput = page.locator('[data-qa="first_name"]');
    this.lastNameInput = page.locator('[data-qa="last_name"]');
    this.companyInput = page.locator('[data-qa="company"]');
    this.address1Input = page.locator('[data-qa="address"]');
    this.address2Input = page.locator('[data-qa="address2"]');
    this.countrySelect = page.locator('[data-qa="country"]');
    this.stateInput = page.locator('[data-qa="state"]');
    this.cityInput = page.locator('[data-qa="city"]');
    this.zipcodeInput = page.locator('[data-qa="zipcode"]');
    this.mobileNumberInput = page.locator('[data-qa="mobile_number"]');

    // Create Account Button
    this.createAccountButton = page.locator('[data-qa="create-account"]');
  }

  async fillAccountInformation(data: UserRegistrationData): Promise<void> {
    if (data.title === 'Mrs') {
      await this.genderMrsRadio.check();
    } else {
      await this.genderMrRadio.check();
    }

    if (data.password) {
      await this.passwordInput.fill(data.password);
    }

    if (data.birthDay) {
      await this.daysSelect.selectOption(data.birthDay);
    }
    if (data.birthMonth) {
      await this.monthsSelect.selectOption(data.birthMonth);
    }
    if (data.birthYear) {
      await this.yearsSelect.selectOption(data.birthYear);
    }

    if (data.newsletter) {
      await this.newsletterCheckbox.check();
    }
    if (data.specialOffers) {
      await this.specialOffersCheckbox.check();
    }
  }

  async fillAddressInformation(address: UserAddress): Promise<void> {
    await this.firstNameInput.fill(address.firstName);
    await this.lastNameInput.fill(address.lastName);

    if (address.company) {
      await this.companyInput.fill(address.company);
    }

    await this.address1Input.fill(address.address1);

    if (address.address2) {
      await this.address2Input.fill(address.address2);
    }

    await this.countrySelect.selectOption(address.country);
    await this.stateInput.fill(address.state);
    await this.cityInput.fill(address.city);
    await this.zipcodeInput.fill(address.zipcode);
    await this.mobileNumberInput.fill(address.mobileNumber);
  }

  async submitAccountCreation(): Promise<void> {
    await this.createAccountButton.click();
  }

  async completeRegistration(data: UserRegistrationData): Promise<void> {
    await this.fillAccountInformation(data);
    await this.fillAddressInformation(data.address);
    await this.submitAccountCreation();
  }
}
