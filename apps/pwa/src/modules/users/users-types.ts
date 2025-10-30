import { BaseMongoEntity, Query } from "@/types";
import { AppLocale } from "../lang/lang-types";
import { WorkspaceType } from "../workspaces/workspaces-types";
import { WorkspaceRoleEntity } from "../workspace-roles/workspace-roles-types";

export enum UserRole {
  ADMIN = "ADMIN",
  SYS_ADMIN = "SYS_ADMIN",
}

export interface UserAuthProvider {
  providerId: string;
  uid: string;
  username?: string;
}

export interface UserEntity extends BaseMongoEntity {
  name: string;
  avatar?: string;
  email?: string;
  birthday?: number | null;
  phone?: string;
  authVersion: number;
  role: UserRole;
  lastSignInAt?: number;
  isEmailVerified?: boolean;
  color?: string;
  locale?: AppLocale;
  isPasswordProvided: boolean;
  settings: UserSettings;
  providers: UserAuthProvider[];
}

export interface UpdateUserProfileDto {
  name: string;
  avatar?: string;
  birthday?: number | null;
  phone?: string;
  email?: string;
  settings?: UserSettings;
}

export interface UserQuery extends Query {
  q?: string;
}

export interface UserClient {
  userId: string;
  workspaceId: string;
  deviceId: string;
}

export interface UserClients {
  [socketId: string]: UserClient;
}

export interface SignOutDto {
  deviceId: string;
}

export interface UpdateUserPasswordDto {
  password: string;
  plainPassword: string;
}

export interface UserSettings {
  locale?: AppLocale;
  timezone?: string;
  dateFormat?: string;
  isStartOfWeekSunday?: boolean;
  isTwelveHour?: boolean;
}

export interface UserMutualWorkspace {
  _id: string;
  name: string;
  type: WorkspaceType;
  logo?: string;
  color?: string;
  displayName?: string;
  memberId: string;
  memberColor?: string;
  roles: Pick<WorkspaceRoleEntity, "_id" | "name" | "color">[];
}

export interface UserPublicInformation {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  birthday?: number;
  phone?: string;
  color?: string;
  lastSignInAt?: number;
  providers: UserAuthProvider[];
  mutualWorkspaces: UserMutualWorkspace[];
}
