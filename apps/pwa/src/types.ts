import { CustomField } from "./modules/custom-fields/custom-field-types";
import { WorkspaceBranchDataFragment } from "./modules/workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import { WorkspaceMemberFragment } from "./modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";

export interface RelatedEntity {
  entity: AppEntity;
  id: string;
}

export interface BaseEntity {
  createdAt: number;
  updatedAt?: number;
  workspaceId?: string;
  lastInteractionAt?: number;
  isArchived?: boolean;
  createdByUser?: WorkspaceMemberFragment;
  createdByUserId?: string;
  assigneeUserIds?: string[];
  assigneeUsers?: WorkspaceMemberFragment[];
  workspaceBranchId?: string;
  workspaceBranch?: Pick<WorkspaceBranchDataFragment, "_id" | "name" | "hotline">;
  relatedEntities?: RelatedEntity[];
  customFields?: CustomField[];
}

export interface BaseMongoEntity extends BaseEntity {
  _id: string;
}

export interface BasePostgresEntity extends BaseEntity {
  id: string;
}

export interface ObjectData {
  [fieldName: string]: any;
}

export interface Query {
  offset?: number;
  limit?: number;
  getAll?: boolean;
  sort?: string;
}

export interface WorkSlot {
  id: string;
  dayWeek: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  groupId?: string;
  bg?: string;
  borderColor?: string;
  title?: string;
  temp?: boolean;
}

export interface ResponseList<T> {
  data: T[];
  count: number;
}

export enum Period {
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type ViewportType = "desktop" | "tablet" | "mobile";

export interface ViewWidget<T = string> {
  id: string;
  type: T;
  state?: any;
  defaultState?: any;
}

export enum AppEntity {
  CUSTOMERS = "C",
  CUSTOMER_FORMS = "CF",
  PARTNERS = "PA",
  TASKS = "A",
  PRODUCTS = "P",
  PRODUCT_VOUCHERS = "PV",
  RECEIPTS = "R",
  BILLINGS = "B",
  BANK_TRANSACTIONS = "N",
  PRESCRIPTIONS = "PRS",
  LOANS = "L",
  TAGS = "TGS",
  COMMENTS = "CMT",
  ORDERS = "O",
  USERS = "U",
  WORKSPACES = "WS",
  WORKSPACE_BRANCHES = "WB",
  WORKSPACE_MEMBERS = "M",
  MESSAGE_BOXES = "MB",
  MESSAGES = "MS",
  POSTS = "PS",
  CATEGORIES = "CT",
  PROMOTIONS = "PR",
  HRM_TIMEKEEPINGS = "HTK",
  ACTIVITIES = "AC",
}

export interface AppPageMetadata {
  title: string;
  description?: string;
  images?: string[];
  icons?: string[] | string;
}

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export interface AppCurrency {
  code: string;
  symbol: string;
  name: string;
  stepPrice: number;
  roundPrecision?: number;
  symbolPosition?: "prefix" | "suffix";
}

export interface AppMetadata {
  title: string;
  webURL: string;
  thumbnailURL: string;
  description: string;
  siteName: string;
  type: string;
  favicon: string;
  appName?: string;
  appIcon?: string;
  appColor?: string;
  appColorShape?: number;
  workspaceId?: string;
  isExtended: boolean;
}

export enum DynamicSelectionOperator {
  INCLUDES = "INCLUDES",
  EXCLUDES = "EXCLUDES",
}

export interface DynamicSelection<ValueType = any> {
  entity?: string;
  operator: DynamicSelectionOperator;
  value: ValueType[];
}

export type DeepWithoutTypename<T> = T extends object
  ? {
      [K in keyof T as Exclude<K, "__typename">]: DeepWithoutTypename<T[K]>;
    }
  : T;
