import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from '@/helpers/api/base.api';
import type { ProductsApiResponse, GenericApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/data/constants/endpoints';

export class ProductsApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request, 'ProductsApi');
  }

  async getAllProducts(): Promise<{ response: APIResponse; data: ProductsApiResponse }> {
    this.logger.info(`Fetching all products via GET ${API_ENDPOINTS.PRODUCTS.LIST}`);
    const response = await this.get(API_ENDPOINTS.PRODUCTS.LIST);
    const data = (await response.json()) as ProductsApiResponse;
    this.logger.info(`Received ${data.products?.length ?? 0} products from API`);
    return { response, data };
  }

  async postAllProducts(): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Sending unsupported POST to ${API_ENDPOINTS.PRODUCTS.LIST}`);
    const response = await this.post(API_ENDPOINTS.PRODUCTS.LIST);
    const data = (await response.json()) as GenericApiResponse;
    return { response, data };
  }

  async searchProducts(keyword: string): Promise<{ response: APIResponse; data: ProductsApiResponse }> {
    this.logger.info(`Searching products with keyword "${keyword}" via POST ${API_ENDPOINTS.PRODUCTS.SEARCH}`);
    const response = await this.postForm(API_ENDPOINTS.PRODUCTS.SEARCH, {
      search_product: keyword,
    });
    const data = (await response.json()) as ProductsApiResponse;
    this.logger.info(`Found ${data.products?.length ?? 0} products matching "${keyword}"`);
    return { response, data };
  }
}
