const defaultConfig = {
  ENV: "development",
  PUBLIC_URL: "http://localhost:3000",
  APP_URL: "http://localhost:3000",
  API_TOOLS_URL: "http://localhost:4000",
  API_CLIENT_SIDE_URL: "http://localhost:4000",
  API_SERVER_SIDE_URL: "http://localhost:4000",
  SECRET_KEY: "wzsjaledyu",
  ANALYTICS_KEY: "",
  SENTRY_DSN: "",
};

export type Config = typeof defaultConfig;
const config: Config = defaultConfig;

export default config;
