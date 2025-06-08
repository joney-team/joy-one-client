import { MainRequest } from "@/modules/requests/main.request";
import { AppConfig } from "./types";
import config from "@joy-one-client/config";

export function getAppConfig() {
  return MainRequest.get<AppConfig>(`/config`);
}

export function isExtendedApp() {
  return process.env['NEXT_PUBLIC_EXTENDED_APP'] === 'true';
}

export function isDevelopment() {
  return (config.ENV as string) === 'development';
}