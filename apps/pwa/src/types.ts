export interface Coordinates {
  lat: number;
  lng: number;
}

export type ViewportType = "desktop" | "tablet" | "mobile";

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

export interface PageMetadata {
  title: string;
  webURL: string;
  thumbnailURL: string;
  description: string;
  siteName: string;
  type: string;
  favicon: string;
  appName?: string | null;
  appIcon?: string | null;
  appColor?: string | null;
  appColorShape?: number | null;
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

