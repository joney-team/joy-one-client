import { BaseMongoEntity } from "./database";
import { AppLocale } from "./lang";

export interface CreateUserDto {
  name: string;
  email: string;
  plainPassword?: string;
  avatar?: string;
}

export interface UpdateUserPasswordDto {
  plainPassword: string;
  password?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS_PARTNER = 'BUSINESS_PARTNER',
  SYS_ADMIN = 'SYS_ADMIN',
}

export interface UpdateUserProfileDto {
  name: string;
  avatar?: string;
  color?: string;
  birthday?: number;
  phone?: string;
  email?: string;
  settings?: UserSettings;
}

export interface UserClient {
  userId: string;
  workspaceId?: string;
  deviceId: string;
}

export interface UserClients {
  [socketId: string]: UserClient;
}

export interface UserAuthProvider {
  providerId: string;
  uid: string;
  username?: string;
}

export interface SignOutDto {
  deviceId: string;
}

export interface UpdateUserRefCodeDto {
  refCode: string;
}

export interface SetUserLocaleDto {
  locale?: AppLocale;
}

export interface UserSettings {
  locale?: AppLocale;
  timezone?: string;
  dateFormat?: string;
  isStartOfWeekSunday?: boolean;
  isTwelveHour?: boolean;
}

export enum UserType {
  USER = 'USER',
  APP = 'APP',
}

export interface UserAppDto {
  name: string;
  email: string;
}

export interface UserEntity extends BaseMongoEntity {
  type: UserType;
  name: string;
  email: string;
  avatar?: string;
  birthday?: number;
  phone?: string;
  color?: string;
  isEmailVerified?: boolean;
  password?: string;
  authVersion: number;
  role: UserRole;
  lastSignInAt?: number;
  provider?: string;
  providers: UserAuthProvider[];
  activatedWorkspaceId?: string;
  deviceIds: string[];
  refCode?: string;
  locale?: AppLocale;
  settings?: UserSettings;
}
