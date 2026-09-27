import { APIRequestContext, APIResponse } from '@playwright/test';
import { UserRegistrationData } from '@/types/user.types';

export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, {
      data,
      headers,
    });
  }

  async postForm(url: string, form: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, {
      form,
    });
  }

  async createAccount(userData: UserRegistrationData): Promise<APIResponse> {
    return this.request.post('/api/createAccount', {
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
  }

  async deleteAccount(email: string, password: string): Promise<APIResponse> {
    return this.request.delete('/api/deleteAccount', {
      form: {
        email,
        password,
      },
    });
  }

  async get(url: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(url, {
      params,
    });
  }
}

