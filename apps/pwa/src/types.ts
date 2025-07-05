import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { CustomField } from "./modules/custom-fields/custom-field-types";

export interface RelatedEntity {
  entity: AppEntity;
  id: string;
}

export interface BaseEntity {
  createdAt: number
  updatedAt?: number
  workspaceId?: string
  lastInteractionAt?: number
  isArchived?: boolean
  createdByUser?: WorkspaceMemberInfo
  createdByUserId?: string
  assigneeUserIds?: string[]
  assigneeUsers?: WorkspaceMemberInfo[]
  workspaceBranchId?: string
  workspaceBranch?: Pick<WorkspaceBranchEntity, '_id' | 'name'>
  relatedEntities?: RelatedEntity[]
  customFields?: CustomField[]
}

export interface BaseMongoEntity extends BaseEntity {
  _id: string
}

export interface BasePostgresEntity extends BaseEntity {
  id: string
}

export interface ObjectData {
  [fieldName: string]: any
}

export interface Query {
  offset?: number,
  limit?: number,
  getAll?: boolean,
  sort?: string,
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
  data: T[],
  count: number
}

export enum StorageKey {
  ACCESS_TOKEN = '_u_udleafdmaz',
  ACCESS_TOKEN_IV = '_u_synylghedt',
  REFRESH_TOKEN = '_ur_yztnldjdsl',
  REFRESH_TOKEN_IV = '_ur_ycclsptyde',
  WORKSPACE_ID = '_w_rerrogiluu',
  BRANCH_ID = '_b_rerkiwunauw',
  DEVICE_ID = '_d_xhpvqngimd',
  META_ACCESS_TOKEN = '_m_at',
  LOCALE = 'lo',
  SESSION_ID = '_s_id',
  WORKSPACE_AUTH_SESSION_ID = '_ws_sid',
  LAYOUT_NAVIGATION_WIDTH = '_l_nw',
}

export enum Period {
  DATE = 'date',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type ViewportType = 'desktop' | 'tablet' | 'mobile';

export interface ViewWidget<T = string> {
  id: string;
  type: T;
  state?: any;
  defaultState?: any;
}

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
  COMMENTS = 'CMT',
  ORDERS = 'O',
  USERS = 'U',
  WORKSPACES = 'WS',
  WORKSPACE_BRANCHES = 'WB',
  WORKSPACE_MEMBERS = 'M',
  MESSAGE_BOXES = 'MB',
  MESSAGES = 'MS',
  POSTS = 'PS',
  CATEGORIES = 'CT',
}

export interface AppPageMetadata {
  title: string;
  description?: string;
  images?: string[];
  icons?: string[] | string;
}

export enum CalendarView {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface AppCurrency {
  code: string;
  symbol: string;
  name: string;
  stepPrice: number;
  roundPrecision?: number;
  symbolPosition?: 'prefix' | 'suffix';
}

export interface AppConfig {
  name: string,
  version: string,
  timeZone: string,
  UTC: string,
  workspaceDomainIP: string,
  metaAppId: string,
  metaAppVersion: string,
  zaloAppId: string,
  currencies: AppCurrency[],
}

export enum EntitySource {
  INTERNAL = 'INTERNAL',
  IMPORT = 'IMPORT',
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
  INCLUDES = 'INCLUDES',
  EXCLUDES = 'EXCLUDES',
}

export interface DynamicSelection<ValueType = any> {
  entity?: string;
  operator: DynamicSelectionOperator;
  value: ValueType[];
}