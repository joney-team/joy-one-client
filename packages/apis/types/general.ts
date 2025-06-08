export enum EntitySource {
  INTERNAL = 'INTERNAL',
  IMPORT = 'IMPORT',
}

export enum Period {
  DATE = 'date',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum AppEntity {
  CUSTOMERS = 'C',
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
}

export interface AppPageMetadata {
  title: string;
  description?: string;
  images?: string[];
  icons?: string[] | string;
}

export interface AppCurrency {
  code: string;
  symbol: string;
  name: string;
  stepPrice: number;
  roundPrecision?: number;
  symbolPosition?: 'prefix' | 'suffix';
}

export interface AppFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
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

export interface AppConfig {
  name: string,
  version: string,
  workspaceDomainIP: string,
  metaAppId: string,
  metaAppVersion: string,
  metaAppScope: string[],
  zaloAppId: string,
  firebase: AppFirebaseConfig,
  socialLinks: {
    provider: string,
    link: string,
  }[],
}

export interface ResponseList<T> {
  data: T[],
  count: number
}

export enum CalendarView {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}