import env from "./config-env";

const initializeConfig = {
  ENV: "development",
  PUBLIC_URL: "http://localhost:3000",
  APP_URL: "http://localhost:3000",
  API_CLIENT_SIDE_URL: "http://localhost:4000",
  API_SERVER_SIDE_URL: "http://localhost:4000",
  SECRET_KEY: "",
  ANALYTICS_KEY: "",
  SENTRY_DSN: "",
  GOOGLE_MAPS_KEY: "",
  PRIMARY_COLOR: "#3cbd52",
};

export default Object.keys(initializeConfig).reduce(
  (acc, key) => {
    acc[key] =
      (env as Record<string, string>)[key] ||
      initializeConfig[key as keyof typeof initializeConfig];
    return acc;
  },
  {} as Record<string, string>,
) as typeof initializeConfig;
