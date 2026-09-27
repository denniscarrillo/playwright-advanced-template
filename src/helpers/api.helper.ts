import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, {
      data,
      headers,
    });
  }

  async get(url: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(url, {
      params,
    });
  }
}
