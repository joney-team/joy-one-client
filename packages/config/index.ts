const ENV = "production";

export interface EnvironmentConfig {
  PUBLIC_URL: string;
  APP_URL: string;
  API_CLIENT_SIDE_URL: string;
  API_SERVER_SIDE_URL: string;
  SECRET_KEY: string;
}

const environmentConfigs: Record<string, EnvironmentConfig> = {
  development: {
    PUBLIC_URL: "http://localhost:3000",
    APP_URL: "http://localhost:3000",
    API_CLIENT_SIDE_URL: "http://localhost:4000",
    API_SERVER_SIDE_URL: "http://localhost:4000",
    SECRET_KEY: "wzsjaledyu",
    // PUBLIC_URL: "https://joyone.vn",
    // APP_URL: "https://app.joyone.vn",
    // API_CLIENT_SIDE_URL: "https://api.joyone.vn",
    // API_SERVER_SIDE_URL: "http://jo-server:4000",
    // SECRET_KEY: "wzsjaledyu",
  },
  staging: {
    PUBLIC_URL: "https://staging.joyone.vn",
    APP_URL: "https://staging.joyone.vn",
    API_CLIENT_SIDE_URL: "https://staging-api.joyone.vn",
    API_SERVER_SIDE_URL: "http://jo-server:4000",
    SECRET_KEY: "wzsjaledyu",
  },
  production: {
    PUBLIC_URL: "https://joyone.vn",
    APP_URL: "https://app.joyone.vn",
    API_CLIENT_SIDE_URL: "https://api.joyone.vn",
    API_SERVER_SIDE_URL: "http://joy-one-jo-server-8bogeh:4000",
    SECRET_KEY: "wzsjaledyu",
  },
}

export type Config = EnvironmentConfig & {
  ENV: string;
};

const config: Config = {
  ...environmentConfigs[ENV] || environmentConfigs.development,
  ENV,
};

export default config;