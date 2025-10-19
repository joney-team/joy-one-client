const ENV = "development";

export interface EnvironmentConfig {
  PUBLIC_URL: string;
  APP_URL: string;
  API_CLIENT_SIDE_URL: string;
  API_TOOLS_URL: string;
  API_SERVER_SIDE_URL: string;
  SECRET_KEY: string;
  ANALYTICS_KEY: string;
  SENTRY_DSN: string;
}

const environmentConfigs: Record<string, EnvironmentConfig> = {
  development: {
    PUBLIC_URL: "http://localhost:3000",
    APP_URL: "http://localhost:3000",
    API_TOOLS_URL: "http://localhost:4000",
    API_CLIENT_SIDE_URL: "http://localhost:4000",
    API_SERVER_SIDE_URL: "http://localhost:4000",
    SECRET_KEY: "wzsjaledyu",
    ANALYTICS_KEY: "t9j567r7qx",
    SENTRY_DSN: "https://73c47d7433184a648c959aed0875411a@glitchtip.joyone.vn/2",
  },
  staging: {
    PUBLIC_URL: "https://staging.joyone.vn",
    APP_URL: "https://staging-app.joyone.vn",
    API_TOOLS_URL: "https://staging-api.joyone.vn",
    API_CLIENT_SIDE_URL: "https://staging-api.joyone.vn",
    API_SERVER_SIDE_URL: "http://joy-one-staging-server-apis-ol2vcf:4000",
    SECRET_KEY: "wzsjaledyu",
    ANALYTICS_KEY: "t9j567r7qx",
    SENTRY_DSN: "https://73c47d7433184a648c959aed0875411a@glitchtip.joyone.vn/2",
  },
  production: {
    PUBLIC_URL: "https://joyone.vn",
    APP_URL: "https://app.joyone.vn",
    API_TOOLS_URL: "https://api.joyone.vn",
    API_CLIENT_SIDE_URL: "https://api.joyone.vn",
    API_SERVER_SIDE_URL: "http://joy-one-server-apis-jvh0gk:4000",
    SECRET_KEY: "wzsjaledyu",
    ANALYTICS_KEY: "t9j567r7qx",
    SENTRY_DSN: "https://73c47d7433184a648c959aed0875411a@glitchtip.joyone.vn/2",
  },
};

export type Config = EnvironmentConfig & {
  ENV: string;
  isDevelopment: boolean;
};

const config: Config = {
  ...(environmentConfigs[ENV] || environmentConfigs.development),
  ENV,
  // @ts-ignore
  isDevelopment: ENV === "development",
};

export default config;
