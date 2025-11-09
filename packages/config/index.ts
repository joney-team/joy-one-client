import { parse } from "dotenv";

const env = parse(".env");

const defaultConfig = {
  ENV: env.ENV,
  PUBLIC_URL: env.PUBLIC_URL,
  APP_URL: env.APP_URL,
  API_TOOLS_URL: env.API_TOOLS_URL,
  API_CLIENT_SIDE_URL: env.API_CLIENT_SIDE_URL,
  API_SERVER_SIDE_URL: env.API_SERVER_SIDE_URL,
  SECRET_KEY: env.SECRET_KEY,
  ANALYTICS_KEY: env.ANALYTICS_KEY,
  SENTRY_DSN: env.SENTRY_DSN,
  IS_DEVELOPMENT: env.ENV === "development",
};

export type Config = typeof defaultConfig;
const config: Config = defaultConfig;

export default config;
