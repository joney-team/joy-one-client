import { AppEntity, WorkSlot } from "./general";
import { PluginBankAccount } from "./plugin-banks";
import { PluginMailerAccount } from "./plugin-mailer";
import { HrmTimekeepingsRules } from "./hrm-timekeepings";
import { WorkspacePermission } from "./workspace-roles";
import { TaskStatus } from "./tasks";
import { ReceiptPaymentMethod } from "./receipts";
import { BaseMongoEntity } from "./database";

export interface Widget<Type = string> {
  id: string;
  type: Type;
  state?: any;
}

export enum ReportWidgetType {
  TASKS = 'TASKS',
  TASK_TIME_TRACKINGS = 'TASK_TIME_TRACKINGS',
  TASKS_COMPLETED_RATES = 'TASKS_COMPLETED_RATES',
  REVENUE = 'REVENUE',
  REVENUE_CHART = 'REVENUE_CHART',
  NEW_CUSTOMERS = 'NEW_CUSTOMERS',
  NEW_CUSTOMERS_CHART = 'NEW_CUSTOMERS_CHART',
  LIST_PRODUCTS_SERVICE = 'LIST_PRODUCTS_SERVICE',
  LOANS_RECEIPTS = 'LOANS_RECEIPTS',
  LOANS_FULFILLED = 'LOANS_FULFILLED',
  LOANS_NEW_CHART = 'LOANS_NEW_CHART',
  LOANS_FEE = 'LOANS_FEE',
  LOANS_CAPITAL = 'LOANS_CAPITAL',
  LOANS_EXPENSE = 'LOANS_EXPENSE',
  LOANS_FULFILLED_AMOUNT_CHART = 'LOANS_FULFILLED_AMOUNT_CHART',
}

export enum DashboardWidgetType {
  TODAY_REVENUE = 'TODAY_REVENUE',
  TODAY_NEW_CUSTOMERS = 'TODAY_NEW_CUSTOMERS',
  TODAY_BOOKINGS = 'TODAY_BOOKINGS',

  REVENUE_CHART = 'REVENUE_CHART',
  BOOKINGS_CHART = 'BOOKINGS_CHART',
  NEW_CUSTOMERS_CHART = 'NEW_CUSTOMERS_CHART',
  TASKS_TODO = 'TASKS_TODO',
  TASKS_PROCESSING = 'TASKS_PROCESSING',
  TASKS_CHART = 'TASKS_CHART',
  TASKS_COMPLETED_RATE_CHART = 'TASKS_COMPLETED_RATE_CHART',
}

export interface WorkspaceSearchSettings {
  hideEntities?: AppEntity[];
}

export interface WorkspaceViewComponent {
  type: 'MODULE' | 'DIVIDER';
  id: string;
  moduleId?: string;
  dividerName?: string;
}

export interface WorkspaceView {
  dashboardWidgets?: Widget<DashboardWidgetType>[] | null;
  reportWidgets?: Widget<ReportWidgetType>[] | null;
  menu?: WorkspaceViewComponent[] | null;
}

export interface SetWorkspaceSettingsDto {
  wSlots?: WorkSlot[];
  bankAccount?: PluginBankAccount;
  mailer?: PluginMailerAccount;
  hrmTimeKeepingsRules?: HrmTimekeepingsRules;
  memberPermissions?: WorkspacePermission[];
  allowPayTicketMultipleTimes?: boolean;
  allowTip?: boolean;
  allowDuplicateBookings?: boolean;
  receiptImagesRequired?: boolean;
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;
  bookingsAutoRemindCustomerBookingBeforeDays?: number;
  bookingsAutoRemindCustomerBookingTime?: string;
  taskStatuses?: TaskStatus[];
  termsOfService?: string;
  privacyPolicy?: string;
  view?: WorkspaceView;
  searchSettings?: WorkspaceSearchSettings;
  currencyCode?: string;
  isAuthSessionRestricted?: boolean;
}


export interface WorkspaceSearchSettings {
  hideEntities?: AppEntity[];
}

export interface WorkspaceSettingEntity extends BaseMongoEntity {
  workspaceId: string;
  wSlots: WorkSlot[];
  bankAccount?: PluginBankAccount;
  mailer?: PluginMailerAccount;
  hrmTimeKeepingsRules?: HrmTimekeepingsRules;
  allowPayTicketMultipleTimes?: boolean;
  bookingsAutoRemindCustomerBookingBeforeDays?: number;
  bookingsAutoRemindCustomerBookingTime?: string;
  allowTip?: boolean;
  allowDuplicateBookings?: boolean;
  memberPermissions: WorkspacePermission[];
  taskStatuses: TaskStatus[];
  termsOfService?: string;
  policy?: string;
  view?: WorkspaceView;
  receiptImagesRequired?: boolean;
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;
  searchSettings?: WorkspaceSearchSettings;
  currencyCode?: string;
  isAuthSessionRestricted?: boolean;
}

export interface SetWorkspaceSettingsDto {
  wSlots?: WorkSlot[];
  bankAccount?: PluginBankAccount;
  mailer?: PluginMailerAccount;
  hrmTimeKeepingsRules?: HrmTimekeepingsRules;
  allowPayTicketMultipleTimes?: boolean;
  bookingsAutoRemindCustomerBookingBeforeDays?: number;
  bookingsAutoRemindCustomerBookingTime?: string;
  allowTip?: boolean;
  allowDuplicateBookings?: boolean;
  memberPermissions?: WorkspacePermission[];
  taskStatuses?: TaskStatus[];
  termsOfService?: string;
  policy?: string;
  view?: WorkspaceView;
  receiptImagesRequired?: boolean;
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;
  searchSettings?: WorkspaceSearchSettings;
  currencyCode?: string;
  isAuthSessionRestricted?: boolean;
}