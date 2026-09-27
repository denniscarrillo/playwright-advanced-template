import { APIRequestContext, APIResponse } from '@playwright/test';
import { createLogger, type Logger } from '@/utils/logger.util';

export abstract class BaseApi {
  protected readonly logger: Logger;
  protected defaultHeaders: Record<string, string> = {};

  constructor(
    protected readonly request: APIRequestContext,
    controllerName: string
  ) {
    this.logger = createLogger(controllerName);
  }

  /**
   * Sets an Authorization Bearer token or custom header for subsequent requests.
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    this.logger.debug('Authorization Bearer token set');
  }

  /**
   * Sets custom default headers for this controller instance.
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  protected async get(url: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP GET to: ${url}`);
    return this.request.get(url, {
      params,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async post(url: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP POST to: ${url}`);
    return this.request.post(url, {
      data,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async postForm(url: string, form: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP POST (Form) to: ${url}`);
    return this.request.post(url, {
      form,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async put(url: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP PUT to: ${url}`);
    return this.request.put(url, {
      data,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async putForm(url: string, form: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP PUT (Form) to: ${url}`);
    return this.request.put(url, {
      form,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async delete(url: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP DELETE to: ${url}`);
    return this.request.delete(url, {
      params,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }

  protected async deleteForm(url: string, form: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP DELETE (Form) to: ${url}`);
    return this.request.delete(url, {
      form,
      headers: { ...this.defaultHeaders, ...headers },
    });
  }
}
