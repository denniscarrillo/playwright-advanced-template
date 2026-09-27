import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from '@/helpers/api/base.api';
import type { BrandsApiResponse, GenericApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/data/constants/endpoints';

export class BrandsApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request, 'BrandsApi');
  }

  async getAllBrands(): Promise<{ response: APIResponse; data: BrandsApiResponse }> {
    this.logger.info(`Fetching all brands via GET ${API_ENDPOINTS.BRANDS.LIST}`);
    const response = await this.get(API_ENDPOINTS.BRANDS.LIST);
    const data = (await response.json()) as BrandsApiResponse;
    this.logger.info(`Received ${data.brands?.length ?? 0} brands from API`);
    return { response, data };
  }

  async putAllBrands(): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Sending unsupported PUT to ${API_ENDPOINTS.BRANDS.LIST}`);
    const response = await this.put(API_ENDPOINTS.BRANDS.LIST);
    const data = (await response.json()) as GenericApiResponse;
    return { response, data };
  }
}
