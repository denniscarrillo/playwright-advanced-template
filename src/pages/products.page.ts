import { Locator, Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ROUTES } from '@/data/constants/routes';

export class ProductsPage extends BasePage {
  readonly header: HeaderComponent;

  readonly allProductsHeading: Locator;
  readonly productsList: Locator;
  readonly productItems: Locator;
  readonly firstProductViewLink: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    this.allProductsHeading = page.getByRole('heading', { name: /all products/i });
    this.productsList = page.locator('.features_items');
    this.productItems = page.locator('.features_items .col-sm-4');
    this.firstProductViewLink = page.locator('a[href*="/product_details/"]').first();
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
  }

  async open(): Promise<void> {
    await this.navigate(ROUTES.PRODUCTS);
  }

  async viewFirstProduct(): Promise<void> {
    this.logger.info("Clicking on 'View Product' of the first product");
    await this.firstProductViewLink.click();
  }

  async viewProductById(id: number | string): Promise<void> {
    this.logger.info(`Clicking on 'View Product' for product ID: ${id}`);
    await this.page.locator(`a[href="/product_details/${id}"]`).click();
  }
}
