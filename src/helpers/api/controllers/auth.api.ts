import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from '@/helpers/api/base.api';
import { UserRegistrationData } from '@/types/user.types';
import type { GenericApiResponse, UserDetailApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/data/constants/endpoints';

export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request, 'AuthApi');
  }

  async createAccount(userData: UserRegistrationData): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Sending API request to create account: ${userData.email}`);
    const response = await this.postForm(API_ENDPOINTS.AUTH.CREATE_ACCOUNT, {
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
    });

    const data = (await response.json()) as GenericApiResponse;
    if (response.ok() && data.responseCode === 201) {
      this.logger.info(`Account created successfully via API: ${userData.email}`);
    } else {
      this.logger.warn(`Account creation response status: ${response.status()}, code: ${data.responseCode}`);
    }

    return { response, data };
  }

  async deleteAccount(email: string, password: string): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Sending API request to delete account: ${email}`);
    const response = await this.deleteForm(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      email,
      password,
    });

    const data = (await response.json()) as GenericApiResponse;
    this.logger.debug(`Account deletion API responseCode: ${data.responseCode}`);
    return { response, data };
  }

  async verifyLogin(
    email?: string,
    password?: string
  ): Promise<{ response: APIResponse; data: GenericApiResponse }> {
    this.logger.info(`Sending API request to verify login for email: ${email ?? '<omitted>'}`);
    const form: Record<string, string> = {};
    if (email !== undefined) form.email = email;
    if (password !== undefined) form.password = password;

    const response = await this.postForm(API_ENDPOINTS.AUTH.VERIFY_LOGIN, form);
    const data = (await response.json()) as GenericApiResponse;
    return { response, data };
  }

  async getUserDetailByEmail(email: string): Promise<{ response: APIResponse; data: UserDetailApiResponse }> {
    this.logger.info(`Fetching user account details for: ${email} via GET ${API_ENDPOINTS.AUTH.USER_DETAIL_BY_EMAIL}`);
    const response = await this.get(API_ENDPOINTS.AUTH.USER_DETAIL_BY_EMAIL, { email });
    const data = (await response.json()) as UserDetailApiResponse;
    return { response, data };
  }
}
