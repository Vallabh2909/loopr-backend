// config.ts
import 'dotenv/config';

function ensureEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  mongoUri: ensureEnvVar('MONGO_URI'),
  port: parseInt(process.env.PORT || '5000', 10),
  accessTokenSecret: ensureEnvVar('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: ensureEnvVar('REFRESH_TOKEN_SECRET'),
  origin: ensureEnvVar('ORIGIN'),
};
