import { BaseMongoEntity } from "@/types";
import { Locale } from "../lang/lang-types";

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
  locale?: Locale;
}

export interface SetDeviceNotificationTokenDto {
  notificationToken: string;
}

export interface SetDeviceLocaleDto {
  locale?: Locale;
}

export interface DeviceEntity extends BaseMongoEntity {
  userAgent: string;
  lastActiveAt: number;
  ua: UaResult;
  notificationToken?: string;
  locale?: Locale;
  userId: string;
}