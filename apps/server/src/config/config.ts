import infos from '../../package.json';
import { getLocalIP } from '../utils/get-local-ip';
import { colorLog } from '../utils/log.utils';

export const PORT = Number(process.env['PORT'] || 4000);

// ======================= Default Config =======================
const defaultConfigs = {
  APP_NAME: infos.name.toUpperCase(),
  APP_VERSION: infos.version,
  APP_BUILD_VERSION: infos.buildVersion,

  ENV: `development`,
  APP_MODE: 'SINGLE', //  SINGLE | MAIN | WORKER

  // Expose URLs
  PUBLIC_URL: `https://joyone.vn`,
  APP_URL: `http://localhost:3000`,
  API_URL: `http://localhost:${PORT}`,

  // Database, Caching
  DATABASE_MONGO_URL: '',
  DATABASE_POSTGRES_URL: '',

  REDIS_URL: 'redis://localhost:6379',
  BULL_REDIS_URL: 'redis://localhost:6379',

  ELASTICSEARCH_URL: 'http://localhost:9200',

  // Analytics & Logging
  SENTRY_DSN: '',
  DISCORD_ALERT_WEBHOOK: '',

  // Integrations
  ZALO_APP_ID: '',
  ZALO_APP_SECRET: '',

  META_APP_VERSION: 'v20.0',
  META_APP_ID: '',
  META_APP_SECRET: '',

  MESSAGE_HUB_URL: 'https://message-hub-api.joyone.vn',
  MESSAGE_HUB_API_KEY: '',

  // Product Owner Billings
  BILLING_ACCOUNT_NAME: '',
  BILLING_ACCOUNT_NUMBER: '',
  BILLING_ACCOUNT_BANK_ID: '',

  // System Admin
  SYS_ADMIN_EMAIL: 'huuthong.mgd@gmail.com',
  SYS_ADMIN_PASSWORD: '',

  // System Mailer
  SYS_MAILER_USER_EMAIL: '',
  SYS_MAILER_USER_PASSWORD: '',

  // System Pay OS
  SYS_PAY_OS_CLIENT_ID: '',
  SYS_PAY_OS_API_KEY: '',
  SYS_PAY_OS_CHECKSUM_KEY: '',

  // System Inherit Key
  INHERIT_KEY: '',

  // System config
  PAYMENT_ORDER_CODE_START_AT: '1000',
  EVENT_THROTTLE_TIME: '900', // 15 mins (900 seconds)
  FILE_CACHE_TIME: '86400', // 1 day (86400 seconds)
  EXTENDED_APP: 'false',

  // System secret keys
  ENCRYPT_PASSWORD: 'joyone_encryption_password',
  WORKSPACE_INVITATION_SECRET_KEY: 'PyM3Job7Hf',
  WORKSPACE_INVITAIONT_TOKEN_EXPIRE_TIME: '28800', // 8 hours

  USER_REFRESH_TOKEN_SECRET_KEY: '5SvaUbMDeP',
  USER_REFRESH_TOKEN_EXPIRE_TIME: '7776000', // 7 days

  USER_ACCESS_TOKEN_SECRET_KEY: 'nq4Hj6l3KK',
  USER_ACCESS_TOKEN_EXPIRE_TIME: '86400', // 1 day

  RENEW_PASSWORD_SESSION_EXPIRE_TIME: '600', // 10 mins

  PORTAL_KEYS: 'none',
  VN_LOCATIONS_API_KEY: '',
};

export const IS_DEV =
  !process.env['ENV'] || process.env['ENV'] === 'development';

export const configs = Object.entries(defaultConfigs).reduce(
  (acc, [key, value]) => {
    if (key === 'API_URL' && IS_DEV) {
      return {
        ...acc,
        [key]: `http://${getLocalIP()}:${PORT}`,
      };
    }

    return {
      ...acc,
      [key]: process.env[key] ?? value,
    };
  },
  defaultConfigs,
);

export const configLogs = () => {
  console.info(
    colorLog.yellow(`------------------ App Configs ------------------`),
  );
  Object.keys(configs).forEach((key) => {
    console.info(`${colorLog.yellow(key)}: ${configs[key].toString()}`);
  });
  console.info(
    colorLog.yellow(`-------------------------------------------------------`),
  );
  console.info('\n');
};

export const IS_TESTING = configs.ENV == 'test';
export const IS_EXTENDED_APP = configs.EXTENDED_APP !== 'false';
export const IS_WORKER_MODE = configs.APP_MODE === 'WORKER';
export const IS_MAIN_MODE = !IS_WORKER_MODE;
