import {
  IconAccessible,
  IconActivityHeartbeat,
  IconAi,
  IconApiApp,
  IconBox,
  IconBuildingBank,
  IconBuildingSkyscraper,
  IconBuildingWarehouse,
  IconCalendar,
  IconCalendarCheck,
  IconCashRegister,
  IconCategory,
  IconCategory2,
  IconClipboardText,
  IconCoins,
  IconCreditCardPay,
  IconFileInvoice,
  IconFiles,
  IconFolderRoot,
  IconForms,
  IconInvoice,
  IconLayout,
  IconLayoutDashboard,
  IconMailbox,
  IconMessage,
  IconMessage2Cog,
  IconMessageCircle,
  IconMessageUser,
  IconNews,
  IconPackage,
  IconPill,
  IconPuzzle,
  IconReportAnalytics,
  IconRosetteDiscount,
  IconSettings,
  IconSettings2,
  IconStack2,
  IconTopologyStar3,
  IconUserScan,
  IconUsersGroup,
  IconUserSquareRounded,
  IconWorld,
} from "@tabler/icons-react";

import { IconFacebook, IconZalo } from "@/components/icons";
import { t } from "../lang/lang-service";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { WorkspaceEntity, WorkspaceType } from "./workspaces-types";

export interface WorkspaceModuleConfig {
  href: string;
  hrefExact?: boolean;

  icon: any;
  isBeta?: boolean;
  restrictDisplay?: ("navigation" | "spotlight")[];

  permissions?: WorkspacePermission | WorkspacePermission[];
  workspaceTypes?: WorkspaceType[];
}

export interface WorkspaceModule extends WorkspaceModuleConfig {
  id: WorkspaceModuleId;
  name: string;
}

const combineModule = (config: WorkspaceModuleConfig): WorkspaceModule => {
  return {
    ...config,
    id: "" as WorkspaceModuleId,
    name: "",
  };
};

export const workspaceModuleConfigs = {
  // Main
  dashboard: combineModule({ href: "/", icon: IconLayoutDashboard, hrefExact: true }),

  // Posts
  posts: combineModule({
    href: "/posts",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_VIEW,
  }),
  postsNew: combineModule({
    href: "/posts/new",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_MANAGER,
    restrictDisplay: ["spotlight"],
  }),

  // Promotions
  promotions: combineModule({
    href: "/promotions",
    icon: IconRosetteDiscount,
    permissions: WorkspacePermission.PROMOTIONS_VIEW,
  }),

  // HRM
  members: combineModule({
    href: "/members",
    icon: IconUsersGroup,
    restrictDisplay: ["spotlight"],
    permissions: WorkspacePermission.WORKSPACE_MEMBERS_VIEW,
  }),
  timekeepings: combineModule({
    href: "/timekeepings",
    icon: IconCalendarCheck,
    permissions: WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP,
  }),

  // Customers
  customers: combineModule({
    href: "/customers",
    icon: IconUserSquareRounded,
    permissions: WorkspacePermission.CUSTOMERS_VIEW,
  }),
  customerForms: combineModule({
    href: "/customer-forms",
    icon: IconMessageUser,
    permissions: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
  }),
  customerKYCs: combineModule({
    href: "/customer-kycs",
    icon: IconUserScan,
    permissions: WorkspacePermission.CUSTOMER_KYCS_MANAGER,
    workspaceTypes: [WorkspaceType.CREDIT],
  }),
  bookings: combineModule({
    href: "/bookings",
    icon: IconCalendar,
    permissions: WorkspacePermission.BOOKING_VIEW,
  }),
  messageBoxes: combineModule({
    href: "/message-boxes",
    icon: IconMessageCircle,
    permissions: WorkspacePermission.MESSAGE_BOXES_MANAGER,
  }),

  // Products
  products: combineModule({
    href: "/products",
    icon: IconBox,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
  }),
  productServices: combineModule({
    href: "/services",
    icon: IconCategory2,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
  }),
  productStocks: combineModule({
    href: "/product-stocks",
    icon: IconBuildingWarehouse,
    permissions: WorkspacePermission.PRODUCT_STOCK_VIEW,
  }),
  productCombos: combineModule({
    href: "/combos",
    icon: IconPackage,
    permissions: WorkspacePermission.PRODUCT_COMBOS_VIEW,
  }),

  partners: combineModule({
    href: "/partners",
    icon: IconTopologyStar3,
    permissions: WorkspacePermission.PARTNERS_WRITE,
  }),
  prescriptions: combineModule({
    href: "/prescriptions",
    icon: IconPill,
    workspaceTypes: [WorkspaceType.DENTAL, WorkspaceType.CLINIC, WorkspaceType.HOSPITAL],
  }),

  // Business
  tasks: combineModule({ href: "/tasks", icon: IconStack2 }),
  orders: combineModule({
    href: "/orders",
    icon: IconClipboardText,
    permissions: WorkspacePermission.ORDERS_VIEW,
  }),
  receipts: combineModule({
    href: "/receipts",
    icon: IconCashRegister,
    permissions: WorkspacePermission.RECEIPTS_VIEW,
  }),
  eInvoices: combineModule({
    href: "/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE,
  }),

  // Credit
  loans: combineModule({
    href: "/loans",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.LOANS_VIEW,
  }),
  loanAssetEstimations: combineModule({
    href: "/loan-asset-estimations",
    icon: IconCoins,
    permissions: WorkspacePermission.LOANS_VIEW,
  }),

  // Workspace Settings
  workspaceSettings: combineModule({
    href: "/workspace-settings",
    icon: IconSettings,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsGeneral: combineModule({
    href: "/workspace-settings/general",
    icon: IconSettings2,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsOperation: combineModule({
    href: "/workspace-settings/operation",
    icon: IconActivityHeartbeat,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsDocuments: combineModule({
    href: "/workspace-settings/documents",
    icon: IconFiles,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsHrmTimekeepings: combineModule({
    href: "/workspace-settings/hrm-timekeepings",
    icon: IconCalendarCheck,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsApp: combineModule({
    href: "/workspace-settings/app",
    icon: IconWorld,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsRoles: combineModule({
    href: "/workspace-settings/roles",
    icon: IconAccessible,
    permissions: WorkspacePermission.WORKSPACE_ROLES_MANAGER,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsCredit: combineModule({
    href: "/workspace-settings/credit",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    workspaceTypes: [WorkspaceType.CREDIT],
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsModules: combineModule({
    href: "/workspace-settings/modules",
    icon: IconLayout,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsBranches: combineModule({
    href: "/workspace-settings/branches",
    icon: IconBuildingSkyscraper,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsApiApps: combineModule({
    href: "/workspace-settings/api-apps",
    icon: IconApiApp,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsMessages: combineModule({
    href: "/workspace-settings/messages",
    icon: IconMessage2Cog,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsCategories: combineModule({
    href: "/workspace-settings/categories",
    icon: IconCategory,
    permissions: WorkspacePermission.CATEGORIES_MANAGER,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsCustomFields: combineModule({
    href: "/workspace-settings/custom-fields",
    icon: IconForms,
    permissions: WorkspacePermission.CUSTOM_FIELDS_MANAGER,
    restrictDisplay: ["spotlight"],
  }),
  workspaceSettingsFileManager: combineModule({
    href: "/workspace-settings/file-manager",
    icon: IconFolderRoot,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),

  // Workspace Setting Plugins
  workspacePlugins: combineModule({
    href: "/workspace-settings/plugins",
    icon: IconPuzzle,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
  }),
  workspacePluginsBanks: combineModule({
    href: "/workspace-settings/plugins/banks",
    icon: IconBuildingBank,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsZaloOas: combineModule({
    href: "/workspace-settings/plugins/zalo-oas",
    icon: IconZalo,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsMetaPages: combineModule({
    href: "/workspace-settings/plugins/meta-pages",
    icon: IconFacebook,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsMailer: combineModule({
    href: "/workspace-settings/plugins/mailer",
    icon: IconMailbox,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsMessageHubs: combineModule({
    href: "/workspace-settings/plugins/message-hubs",
    icon: IconMessage,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsAiAssistants: combineModule({
    href: "/workspace-settings/plugins/ai-assistants",
    icon: IconAi,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),
  workspacePluginsEInvoices: combineModule({
    href: "/workspace-settings/plugins/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
  }),

  // Profile
  profileSettings: combineModule({
    href: "/profile/settings",
    icon: IconSettings,
    restrictDisplay: ["spotlight"],
  }),

  // Reports
  reports: combineModule({
    href: "/reports",
    icon: IconReportAnalytics,
    permissions: WorkspacePermission.REPORTS_VIEW,
  }),
};

export type WorkspaceModuleId = keyof typeof workspaceModuleConfigs;

export const getWorkspaceModuleName = (
  id: WorkspaceModuleId,
  workspace?: Pick<WorkspaceEntity, "type">
) => {
  if (
    workspace &&
    id === "orders" &&
    [
      WorkspaceType.SPA,
      WorkspaceType.HOSPITAL,
      WorkspaceType.CLINIC,
      WorkspaceType.DENTAL,
    ].includes(workspace?.type)
  ) {
    return t("tickets");
  }

  return t(id);
};
