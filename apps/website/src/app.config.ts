
export interface AppEnvironmentVariables {
  PUBLIC_URL: string;
  APP_URL: string;
}

export const appEnvironmentVariables: { [key: string]: AppEnvironmentVariables } = {
  development: {
    // PUBLIC_URL: "http://localhost:3000",
    PUBLIC_URL: "https://414e-171-250-165-210.ngrok-free.app",
    APP_URL: "http://localhost:3000",
  },
  staging: {
    PUBLIC_URL: "https://staging.joyone.vn",
    APP_URL: "https://staging-app.joyone.vn",
  },
  production: {
    PUBLIC_URL: "https://joyone.vn",
    APP_URL: "https://app.joyone.vn",
  }
}

export const ENV = !!appEnvironmentVariables[(process.env as any)['NEXT_PUBLIC_ENV']] ? (process.env as any)['NEXT_PUBLIC_ENV'] : Object.keys(appEnvironmentVariables)[0];
export const CONFIG = appEnvironmentVariables[ENV] as AppEnvironmentVariables;