/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const activeEnv = process.env.ENV ?? 'qa';
config({ path: path.resolve(__dirname, `.env.${activeEnv}`) });

const baseSchema = z.object({
  BASE_URL: z.url(),
  API_BASE_URL: z.url(),
  LOGIN_USER: z.string(),
  LOGIN_PASSWORD: z.string(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const devSchema = baseSchema.extend({
  ENV: z.literal('dev'),
});

const qaSchema = baseSchema.extend({
  ENV: z.literal('qa'),
});

const envSchema = z.discriminatedUnion('ENV', [devSchema, qaSchema]);

const env = envSchema.parse({
  ...process.env,
  ENV: activeEnv,
});

export type Env = z.infer<typeof envSchema>;
export default env;