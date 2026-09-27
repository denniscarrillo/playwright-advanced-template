import { chromium, request, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import env from '@/../env.config';
import { AUTH_STORAGE_PATH } from '@/data/constants/auth';
import { LoginPage } from '@/pages/login.page';
import { HeaderComponent } from '@/pages/components/header.component';
import { ApiHelper } from '@/helpers/api.helper';
import { createLogger } from '@/utils/logger.util';

const logger = createLogger('GlobalSetup');

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL || env.BASE_URL;
  logger.info(`Starting Global Auth Setup for baseURL: ${baseURL}`);

  // Ensure directory exists for auth storage state
  const authDir = path.dirname(AUTH_STORAGE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Pre-seed/ensure global test account exists via API
  const requestContext = await request.newContext({ baseURL });
  const apiHelper = new ApiHelper(requestContext);
  try {
    logger.info(`Ensuring global test user exists via API: ${env.LOGIN_USER}`);
    await apiHelper.createAccount({
      title: 'Mr',
      name: 'Global QA User',
      email: env.LOGIN_USER,
      password: env.LOGIN_PASSWORD,
      birthDay: '1',
      birthMonth: '1',
      birthYear: '1990',
      address: {
        firstName: 'Dennis',
        lastName: 'Carrillo',
        company: 'QA Automation Tech',
        address1: '123 Test Avenue',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        zipcode: '90001',
        mobileNumber: '+1234567890',
      },
    });
  } catch (apiError) {
    logger.warn(`API account creation notice: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  } finally {
    await requestContext.dispose();
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const header = new HeaderComponent(page);

  try {
    logger.info(`Navigating to login page and authenticating as: ${env.LOGIN_USER}`);
    await loginPage.open();
    await loginPage.login({
      email: env.LOGIN_USER,
      password: env.LOGIN_PASSWORD,
    });

    // Verify session is active
    await header.loggedInUserText.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Authentication successful. Persisting storageState...');

    // Save storage state (cookies, localStorage, session)
    await context.storageState({ path: AUTH_STORAGE_PATH });
    logger.info(`Auth storage state persisted successfully to: ${AUTH_STORAGE_PATH}`);
  } catch (error) {
    logger.error(`Global auth setup failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(
      `[GlobalSetup Error] Failed to authenticate global test user "${env.LOGIN_USER}". Please verify valid credentials in .env.<environment>.`
    );
  } finally {
    await context.close();
    await browser.close();
  }
}
