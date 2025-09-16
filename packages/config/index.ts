const ENV = "development";

export interface EnvironmentConfig {
  PUBLIC_URL: string;
  APP_URL: string;
  API_CLIENT_SIDE_URL: string;
  API_TOOLS_URL: string;
  API_SERVER_SIDE_URL: string;
  SECRET_KEY: string;
  ANALYTICS_KEY: string;
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
  },
  staging: {
    PUBLIC_URL: "https://staging.joyone.vn",
    APP_URL: "https://staging-app.joyone.vn",
    API_TOOLS_URL: "https://staging-api.joyone.vn",
    API_CLIENT_SIDE_URL: "https://staging-api.joyone.vn",
    API_SERVER_SIDE_URL: "http://jo-server:4000",
    SECRET_KEY: "wzsjaledyu",
    ANALYTICS_KEY: "t9j567r7qx",
  },
  production: {
    PUBLIC_URL: "https://joyone.vn",
    APP_URL: "https://app.joyone.vn",
    API_TOOLS_URL: "https://api.joyone.vn",
    API_CLIENT_SIDE_URL: "https://api.joyone.vn",
    API_SERVER_SIDE_URL: "http://jo-server:4000",
    SECRET_KEY: "wzsjaledyu",
    ANALYTICS_KEY: "t9j567r7qx",
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
