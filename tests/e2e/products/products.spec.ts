import { test, expect } from '@/fixtures/pages.fixture';

test.describe('Feature: Products Catalog & Details - Authenticated User', () => {
  test.beforeEach(async ({ page, logger }) => {
    logger.info('Verify that logged-in state is visible');
    await test.step('Verify that logged-in state is visible', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByText(/logged in as/i)).toBeVisible();
    });
  });

  test('Test Case 8: Verify All Products and product detail page', async ({
    page,
    header,
    productsPage,
    productDetailPage,
    logger,
  }) => {
    logger.info('Starting Test Case 8: Verify All Products and product detail page');

    await test.step('Navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('Verify that home page is visible successfully', async () => {
      await expect(page).toHaveTitle(/Automation Exercise/);
      await expect(header.navBar).toBeVisible();
    });

    await test.step("Click on 'Products' button", async () => {
      await header.goToProducts();
    });

    await test.step('Verify user is navigated to ALL PRODUCTS page successfully', async () => {
      await expect(page).toHaveURL(/.*products/);
      await expect(productsPage.allProductsHeading).toBeVisible();
    });

    await test.step('Verify that the products list is visible', async () => {
      await expect(productsPage.productsList).toBeVisible();
      await expect(productsPage.productItems.first()).toBeVisible();
      logger.info('Products catalog displayed successfully');
    });

    await test.step("Click on 'View Product' of the first product", async () => {
      await productsPage.viewFirstProduct();
    });

    await test.step('Verify user is landed on product detail page', async () => {
      await expect(page).toHaveURL(/.*product_details/);
      await expect(productDetailPage.productInformationContainer).toBeVisible();
    });

    await test.step('Verify that product details are visible (name, category, price, availability, condition, brand)', async () => {
      await expect(productDetailPage.productName).toBeVisible();
      await expect(productDetailPage.productCategory).toBeVisible();
      await expect(productDetailPage.productPrice).toBeVisible();
      await expect(productDetailPage.productAvailability).toBeVisible();
      await expect(productDetailPage.productCondition).toBeVisible();
      await expect(productDetailPage.productBrand).toBeVisible();

      logger.info('All product detail attributes verified successfully');
    });
  });
});
