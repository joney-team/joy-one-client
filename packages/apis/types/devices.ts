import { BaseMongoEntity } from "./database";
import { AppLocale } from "./lang";

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
  userAgent: string;
  locale?: AppLocale;
}

export interface SetDeviceNotificationTokenDto {
  notificationToken: string;
}

export interface SetDeviceLocaleDto {
  locale?: AppLocale;
}

export interface DeviceEntity extends BaseMongoEntity {
  userAgent: string;
  lastActiveAt: number;
  ua: UaResult;
  notificationToken?: string;
  locale?: AppLocale;
}