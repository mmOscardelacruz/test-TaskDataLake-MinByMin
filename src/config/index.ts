import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  dev: process.env.NODE_ENV !== 'production',
  db: {
    dbPort: process.env.DB_PORT ?? '5432',
    dbUser: process.env.DB_USER ?? 'root',
    dbHost: process.env.DB_HOST ?? 'localhost',
    dbPassword: process.env.DB_PASSWORD ?? '',
    dbName: process.env.DB_NAME ?? 'postgres',
    dbSchema: process.env.DB_SCHEMA ?? 'public',
  },
  cron: {
    cronExpression: process.env.CRON_EXPRESSION ?? '00 00 * * *',
  },
  geotab: {
    goAuthApiURL: process.env.GO_AUTH_API_URL ?? 'https://my1.geotab.com/apiv1',
    goAuthApiKey: process.env.GO_AUTH_API_KEY ?? '',
    goUsername: process.env.GO_USERNAME ?? '',
    goPassword: process.env.GO_PASSWORD ?? '',
    goDatabase: process.env.GO_DATABASE ?? '',
    goServer: process.env.GO_SERVER ?? 'my1.geotab.com',
  },
  timeZone: process.env.TIMEZONE ?? 'America/Mexico_City',
};

export default config;
