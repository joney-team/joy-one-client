import config from "@joy-one-client/config";
import { api } from "./modules/apis";
import { AppConfig } from "./types";

export function getAppConfig() {
  return api.get<AppConfig>(`/config`);
}

export function isExtendedApp() {
  return process.env['NEXT_PUBLIC_EXTENDED_APP'] === 'true';
}

export function isDevelopment() {
  return (config.ENV as string) === 'development';
}

