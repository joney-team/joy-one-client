import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean } from 'class-validator';
import type { Request } from 'express';
import type { CustomerEntity } from './customers/customers.entity';
import type { DeviceEntity } from './devices/devices.entity';
import type { AppLocale } from './lang/lang.types';
import type { UserEntity } from './users/entities/user.entity';
import type { WorkspaceApiAppEntity } from './workspace-api-apps/entities/workspace-api-app.entity';
import type { WorkspaceMember } from './workspace-members/entities/workspace-member.entity';
import type { WorkspaceSdkEntity } from './workspace-sdks/workspace-sdks.entity';
import type { WorkspaceEntity } from './workspaces/entities/workspace.entity';

export enum Metadata {
  REQUIRE_AUTH = 'REQUIRE_AUTH',
  REQUIRE_USER_ROLES = 'REQUIRE_USER_ROLES',
  REQUIRE_WORKSPACE = 'REQUIRE_WORKSPACE',
  REQUIRED_DEVICE = 'REQUIRED_DEVICE',
  REQUIRE_PERMISSION = 'REQUIRE_PERMISSION',
  REQUIRED_SDK_AUTH = 'REQUIRED_SDK_AUTH',
  REQUIRED_WORKSPACE_APP = 'REQUIRED_WORKSPACE_APP',
  RESTRICT_CUSTOMER_CONTACT = 'RESTRICT_CUSTOMER_CONTACT',
  REQUIRE_CUSTOMER = 'REQUIRE_CUSTOMER',
  REQUIRE_PORTAL_KEY = 'REQUIRE_PORTAL_KEY',
}

export type TokenObj<T extends {}> = T & {
  iat: number;
  exp: number;
};

export enum Period {
  DATE = 'DATE',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

registerEnumType(Period, {
  name: 'Period',
  description: 'Available periods for reports',
});

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Available genders',
});

export enum AppEntity {
  CUSTOMERS = 'C',
  CUSTOMER_FORMS = 'CF',
  PARTNERS = 'PA',
  TASKS = 'A',
  PRODUCTS = 'P',
  PRODUCT_VOUCHERS = 'PV',
  RECEIPTS = 'R',
  BILLINGS = 'B',
  BANK_TRANSACTIONS = 'N',
  PRESCRIPTIONS = 'PRS',
  LOANS = 'L',
  TAGS = 'TGS',
  ORDERS = 'O',
  USERS = 'U',
  WORKSPACES = 'WS',
  WORKSPACE_BRANCHES = 'WB',
  WORKSPACE_MEMBERS = 'M',
  WORKSPACE_ROLES = 'WR',
  MESSAGE_BOXES = 'MB',
  MESSAGES = 'MS',
  POSTS = 'PS',
  CATEGORIES = 'CT',
  PROMOTIONS = 'PR',
  ACTIVITIES = 'AC',
}

@ObjectType()
export class PageMetadata {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  icons?: string[] | string;
}

@ObjectType()
export class AppCurrency {
  @Field(() => String)
  code: string;

  @Field(() => String)
  symbol: string;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  stepPrice: number;

  @Field(() => Number, { nullable: true })
  roundPrecision?: number;

  @Field(() => String, { nullable: true })
  symbolPosition?: 'prefix' | 'suffix';
}

@ObjectType()
export class SocialLink {
  @Field(() => String)
  provider: string;

  @Field(() => String)
  link: string;
}

@ObjectType()
export class AppConfig {
  @Field(() => String)
  name: string;

  @Field(() => String)
  version: string;

  @Field(() => String)
  timeZone: string;

  @Field(() => String)
  UTC: string;

  @Field(() => String)
  workspaceDomainIP: string;

  @Field(() => String)
  metaAppId: string;

  @Field(() => [String])
  metaAppScope: string[];

  @Field(() => String)
  metaAppVersion: string;

  @Field(() => String)
  zaloAppId: string;
}

@ObjectType()
export class AppMetadata {
  @Field()
  title: string;

  @Field()
  webURL: string;

  @Field()
  thumbnailURL: string;

  @Field()
  description: string;

  @Field()
  siteName: string;

  @Field()
  type: string;

  @Field()
  favicon: string;

  @Field({ nullable: true })
  appName?: string;

  @Field({ nullable: true })
  appIcon?: string;

  @Field({ nullable: true })
  appColor?: string;

  @Field({ nullable: true })
  workspaceId?: string;

  @Field()
  isExtended: boolean;
}

export enum EntitySource {
  INTERNAL = 'INTERNAL',
  IMPORT = 'IMPORT',
  ZALO_OA = 'ZALO_OA',
}

registerEnumType(EntitySource, {
  name: 'EntitySource',
  description: 'Available entity sources',
});

export interface AppRequest extends Request {
  member?: WorkspaceMember;
  user?: UserEntity;
  workspace?: WorkspaceEntity;
  device?: DeviceEntity;
  sdk?: WorkspaceSdkEntity;
  sessionId?: string;
  locale?: AppLocale;
  workspaceApp?: WorkspaceApiAppEntity;
  customer?: CustomerEntity;
}

export class AppDebug {
  @IsBoolean()
  router: boolean;
}

export enum AdminAction {
  RESET_CACHE = 'RESET_CACHE',
  SEARCH_REINDEX = 'SEARCH_REINDEX',
  SYNC_LOANS = 'SYNC_LOANS',
  PURE_REPORTS = 'PURE_REPORTS',
  SYNC_RECEIPTS = 'SYNC_RECEIPTS',
  AGGREGATE_WORKSPACE_STATS = 'AGGREGATE_WORKSPACE_STATS',
}

registerEnumType(AdminAction, {
  name: 'AdminAction',
  description: 'Available admin actions',
});
