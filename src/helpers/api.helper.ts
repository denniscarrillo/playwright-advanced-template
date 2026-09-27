import { APIRequestContext, APIResponse } from '@playwright/test';
import { UserRegistrationData } from '@/types/user.types';
import { createLogger, type Logger } from '@/utils/logger.util';

export class ApiHelper {
  private readonly logger: Logger = createLogger('ApiHelper');

  constructor(private readonly request: APIRequestContext) {}

  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP POST to: ${url}`);
    return this.request.post(url, {
      data,
      headers,
    });
  }

  async postForm(url: string, form: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP POST (Form) to: ${url}`);
    return this.request.post(url, {
      form,
    });
  }

  async createAccount(userData: UserRegistrationData): Promise<APIResponse> {
    this.logger.info(`Sending API request to create account: ${userData.email}`);
    const response = await this.request.post('/api/createAccount', {
      form: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        title: userData.title ?? 'Mr',
        birth_date: userData.birthDay ?? '1',
        birth_month: userData.birthMonth ?? '1',
        birth_year: userData.birthYear ?? '1990',
        firstname: userData.address.firstName,
        lastname: userData.address.lastName,
        company: userData.address.company ?? '',
        address1: userData.address.address1,
        address2: userData.address.address2 ?? '',
        country: userData.address.country,
        zipcode: userData.address.zipcode,
        state: userData.address.state,
        city: userData.address.city,
        mobile_number: userData.address.mobileNumber,
      },
    });

    if (response.ok()) {
      this.logger.info(`Account created successfully via API [status: ${response.status()}]`);
    } else {
      this.logger.error(`Account creation failed via API [status: ${response.status()}]`);
    }

    return response;
  }

  async deleteAccount(email: string, password: string): Promise<APIResponse> {
    this.logger.info(`Sending API request to delete account: ${email}`);
    const response = await this.request.delete('/api/deleteAccount', {
      form: {
        email,
        password,
      },
    });

    this.logger.debug(`Account deletion API response status: ${response.status()}`);
    return response;
  }

  async get(url: string, params?: Record<string, string>): Promise<APIResponse> {
    this.logger.debug(`HTTP GET to: ${url}`);
    return this.request.get(url, {
      params,
    });
  }
}

