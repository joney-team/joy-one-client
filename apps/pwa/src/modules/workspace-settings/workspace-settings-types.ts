import { AppEntity, BaseMongoEntity, WorkSlot } from "@/types";
import { HrmTimekeepingsRules } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { LoanSettings } from "@/modules/loans/loans-types";
import { BankAccount } from "@/modules/plugins/banks/banks.types";
import { ReceiptPaymentMethod } from "@/modules/receipts/receipts-types";
import { TaskStatus } from "@/modules/tasks/tasks-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { workspaceModules } from "@/modules/workspaces/workspace-modules";
import { PluginMailerAccount } from "@/modules/workspaces/workspaces-types";
import { DashboardWidgetType } from "@/widgets/dashboard/types";
import { ReportWidgetType } from "@/widgets/reports/types";
import { Widget } from "@/widgets/types";
export interface WorkspaceViewComponent {
  id: string;
  type: 'MODULE' | 'DIVIDER';
  moduleId?: keyof typeof workspaceModules;
  dividerName?: string;
}

export interface WorkspaceView {
  dashboardWidgets?: Widget<DashboardWidgetType>[] | null;
  reportWidgets?: Widget<ReportWidgetType>[] | null;
  menu?: WorkspaceViewComponent[] | null;
}

export interface WorkspaceSearchSettings {
  hideEntities?: AppEntity[];
}

export interface WorkspaceSettingEntity extends BaseMongoEntity {
  workspaceId: string;
  wSlots: WorkSlot[];
  bankAccount?: BankAccount;
  mailer?: PluginMailerAccount;
  hrmTimeKeepingsRules?: HrmTimekeepingsRules;
  allowPayTicketMultipleTimes?: boolean;
  bookingsAutoRemindCustomerBookingBeforeDays?: number;
  bookingsAutoRemindCustomerBookingTime?: string;
  allowTip?: boolean;
  allowDuplicateBookings?: boolean;
  loanSettings?: LoanSettings;
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
  bankAccount?: BankAccount;
  mailer?: PluginMailerAccount;
  hrmTimeKeepingsRules?: HrmTimekeepingsRules;
  allowPayTicketMultipleTimes?: boolean;
  bookingsAutoRemindCustomerBookingBeforeDays?: number;
  bookingsAutoRemindCustomerBookingTime?: string;
  allowTip?: boolean;
  allowDuplicateBookings?: boolean;
  loanSettings?: LoanSettings;
  memberPermissions: WorkspacePermission[];
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
