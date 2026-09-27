import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { HeaderComponent } from '@/pages/components/header.component';

export class ProductDetailPage extends BasePage {
  readonly header: HeaderComponent;

  readonly productInformationContainer: Locator;
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    this.productInformationContainer = page.locator('.product-information');
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p', { hasText: /Category/i });
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator('.product-information p', { hasText: /Availability/i });
    this.productCondition = page.locator('.product-information p', { hasText: /Condition/i });
    this.productBrand = page.locator('.product-information p', { hasText: /Brand/i });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('button.cart');
  }
}
