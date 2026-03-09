import type { AppLocale } from "@/graphql/types.graphql";
import { BaseMongoEntity } from "@/types";

interface IBrowser {
  name: string | undefined;
  version: string | undefined;
}

interface IDevice {
  model: string | undefined;
  type: string | undefined;
  vendor: string | undefined;
}

interface IEngine {
  name: string | undefined;
  version: string | undefined;
}

interface IOS {
  name: string | undefined;
  version: string | undefined;
}

interface ICPU {
  architecture: string | undefined;
}

interface UaResult {
  ua: string;
  browser: IBrowser;
  device: IDevice;
  engine: IEngine;
  os: IOS;
  cpu: ICPU;
}

export interface RegisterDeviceDto {
  identifyId: string;
  locale?: AppLocale;
}

export interface SetDeviceNotificationTokenDto {
  notificationToken: string;
}

export interface SetDeviceLocaleDto {
  locale?: AppLocale;
}

export interface DeviceEntity extends BaseMongoEntity {
  userAgent?: string;
  identifyId: string;
  lastActiveAt: number;
  ua: UaResult;
  notificationToken?: string;
  locale?: AppLocale;
  userId: string;
}
