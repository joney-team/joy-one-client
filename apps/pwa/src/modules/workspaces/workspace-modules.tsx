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
import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { WorkspaceType } from "./workspaces-types";

export interface WorkspaceModuleConfig {
  name: () => string;
  description?: () => string;
  color?: MantineColor;

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
}

const combineModule = (config: WorkspaceModuleConfig): WorkspaceModule => {
  return {
    ...config,
    id: "" as WorkspaceModuleId,
  };
};

export const workspaceModuleConfigs = {
  // Main
  dashboard: combineModule({
    href: "/",
    icon: IconLayoutDashboard,
    hrefExact: true,
    name: () => t`Dashboard`,
  }),

  // Posts
  posts: combineModule({
    href: "/posts",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_VIEW,
    name: () => t`Posts`,
  }),
  postsNew: combineModule({
    href: "/posts/new",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_MANAGER,
    restrictDisplay: ["spotlight"],
    name: () => t`New Post`,
  }),

  // Promotions
  promotions: combineModule({
    href: "/promotions",
    icon: IconRosetteDiscount,
    permissions: WorkspacePermission.PROMOTIONS_VIEW,
    name: () => t`Promotions`,
  }),

  // HRM
  members: combineModule({
    href: "/members",
    icon: IconUsersGroup,
    restrictDisplay: ["spotlight"],
    permissions: WorkspacePermission.WORKSPACE_MEMBERS_VIEW,
    name: () => t`Members`,
  }),
  timekeepings: combineModule({
    href: "/timekeepings",
    icon: IconCalendarCheck,
    permissions: WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP,
    name: () => t`Timekeepings`,
  }),

  // Customers
  customers: combineModule({
    href: "/customers",
    icon: IconUserSquareRounded,
    permissions: WorkspacePermission.CUSTOMERS_VIEW,
    name: () => t`Customers`,
  }),
  customerForms: combineModule({
    href: "/customer-forms",
    icon: IconMessageUser,
    permissions: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
    name: () => t`Customer Forms`,
  }),
  customerKYCs: combineModule({
    href: "/customer-kycs",
    icon: IconUserScan,
    permissions: WorkspacePermission.CUSTOMER_KYCS_MANAGER,
    workspaceTypes: [WorkspaceType.CREDIT],
    name: () => t`KYCs`,
  }),
  bookings: combineModule({
    href: "/bookings",
    icon: IconCalendar,
    permissions: WorkspacePermission.BOOKING_VIEW,
    name: () => t`Bookings`,
  }),
  messageBoxes: combineModule({
    href: "/message-boxes",
    icon: IconMessageCircle,
    permissions: WorkspacePermission.MESSAGE_BOXES_MANAGER,
    name: () => t`Message Boxes`,
  }),

  // Products
  products: combineModule({
    href: "/products",
    icon: IconBox,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
    name: () => t`Products`,
  }),
  productServices: combineModule({
    href: "/services",
    icon: IconCategory2,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
    name: () => t`Services`,
  }),
  productStocks: combineModule({
    href: "/product-stocks",
    icon: IconBuildingWarehouse,
    permissions: WorkspacePermission.PRODUCT_STOCK_VIEW,
    name: () => t`Stocks`,
  }),
  productCombos: combineModule({
    href: "/combos",
    icon: IconPackage,
    permissions: WorkspacePermission.PRODUCT_COMBOS_VIEW,
    name: () => t`Combos`,
  }),

  partners: combineModule({
    href: "/partners",
    icon: IconTopologyStar3,
    permissions: WorkspacePermission.PARTNERS_WRITE,
    name: () => t`Partners`,
  }),
  prescriptions: combineModule({
    href: "/prescriptions",
    icon: IconPill,
    workspaceTypes: [WorkspaceType.DENTAL, WorkspaceType.CLINIC, WorkspaceType.HOSPITAL],
    name: () => t`Prescriptions`,
  }),

  // Business
  tasks: combineModule({ href: "/tasks", icon: IconStack2, name: () => t`Tasks` }),
  orders: combineModule({
    href: "/orders",
    icon: IconClipboardText,
    permissions: WorkspacePermission.ORDERS_VIEW,
    name: () => t`Orders`,
  }),
  receipts: combineModule({
    href: "/receipts",
    icon: IconCashRegister,
    permissions: WorkspacePermission.RECEIPTS_VIEW,
    name: () => t`Receipts`,
  }),
  eInvoices: combineModule({
    href: "/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE,
    name: () => t`E-Invoices`,
  }),

  // Credit
  loans: combineModule({
    href: "/loans",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.LOANS_VIEW,
    name: () => t`Loans`,
  }),
  loanAssetEstimations: combineModule({
    href: "/loan-asset-estimations",
    icon: IconCoins,
    permissions: WorkspacePermission.LOANS_VIEW,
    name: () => t`Loan Asset Estimations`,
  }),

  // Workspace Settings
  workspaceSettings: combineModule({
    href: "/workspace-settings",
    icon: IconSettings,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Workspace Settings`,
    description: () => t`Manage the settings of the Workspace`,
    color: "primary",
  }),
  workspaceSettingsGeneral: combineModule({
    href: "/workspace-settings/general",
    icon: IconSettings2,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`General Settings`,
    description: () => t`Set name, address, Hotline, Workspace type, ...`,
    color: "primary",
  }),
  workspaceSettingsOperation: combineModule({
    href: "/workspace-settings/operation",
    icon: IconActivityHeartbeat,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Operation settings`,
    description: () =>
      t`Working time, invoice, service voucher, payment method, search settings, ...`,
    color: "grape",
  }),
  workspaceSettingsDocuments: combineModule({
    href: "/workspace-settings/documents",
    icon: IconFiles,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Documents`,
    description: () => t`Terms of use, privacy policy, user manual, ...`,
    color: "lime",
  }),
  workspaceSettingsHrmTimekeepings: combineModule({
    href: "/workspace-settings/hrm-timekeepings",
    icon: IconCalendarCheck,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Timekeepings settings`,
    description: () =>
      t`Support GPS Check-in, summarize working hours, late, overtime and support salary calculation.`,
    color: "violet",
  }),
  workspaceSettingsApp: combineModule({
    href: "/workspace-settings/app",
    icon: IconWorld,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`App settings`,
    description: () =>
      t`Create an application with a custom domain, customize the application name, icon, color.`,
    color: "blue",
  }),
  workspaceSettingsRoles: combineModule({
    href: "/workspace-settings/roles",
    icon: IconAccessible,
    permissions: WorkspacePermission.WORKSPACE_ROLES_MANAGER,
    restrictDisplay: ["spotlight"],
    name: () => t`Roles`,
    description: () => t`Manage member roles and access permissions`,
    color: "orange",
  }),
  workspaceSettingsCredit: combineModule({
    href: "/workspace-settings/credit",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    workspaceTypes: [WorkspaceType.CREDIT],
    restrictDisplay: ["spotlight"],
    name: () => t`Credit settings`,
    description: () => t`Set loan package, interest, late payment penalty, ...`,
    color: "yellow",
  }),
  workspaceSettingsModules: combineModule({
    href: "/workspace-settings/modules",
    icon: IconLayout,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Modules`,
    description: () => t`Customize the features needed on the navigation bar`,
    color: "teal",
  }),
  workspaceSettingsBranches: combineModule({
    href: "/workspace-settings/branches",
    icon: IconBuildingSkyscraper,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Branches`,
    description: () => t`Manage the branches of the Workspace`,
    color: "blue",
  }),
  workspaceSettingsApiApps: combineModule({
    href: "/workspace-settings/api-apps",
    icon: IconApiApp,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`API Apps`,
    description: () => t`For developers, manipulate data through APIs`,
    color: "teal",
  }),
  workspaceSettingsMessages: combineModule({
    href: "/workspace-settings/messages",
    icon: IconMessage2Cog,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Messages settings`,
    description: () =>
      t`Summarize customer messages from various channels: Zalo, Facebook, Landing Page, ...`,
    color: "yellow",
  }),
  workspaceSettingsCategories: combineModule({
    href: "/workspace-settings/categories",
    icon: IconCategory,
    permissions: WorkspacePermission.CATEGORIES_MANAGER,
    restrictDisplay: ["spotlight"],
    name: () => t`Categories`,
    description: () => t`Manage product, service, post, ...`,
    color: "teal",
  }),
  workspaceSettingsCustomFields: combineModule({
    href: "/workspace-settings/custom-fields",
    icon: IconForms,
    permissions: WorkspacePermission.CUSTOM_FIELDS_MANAGER,
    restrictDisplay: ["spotlight"],
    name: () => t`Custom fields`,
    description: () => t`Manage custom fields for objects: product, service, post, ...`,
    color: "orange",
  }),
  workspaceSettingsFileManager: combineModule({
    href: "/workspace-settings/file-manager",
    icon: IconFolderRoot,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`File manager`,
    description: () => t`Summarize images / documents / files, ...`,
    color: "blue",
  }),

  // Workspace Setting Plugins
  workspacePlugins: combineModule({
    href: "/workspace-settings/plugins",
    icon: IconPuzzle,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    name: () => t`Plugins`,
    description: () => t`Integrate other services / utilities`,
    color: "lime",
  }),
  workspacePluginsBanks: combineModule({
    href: "/workspace-settings/plugins/banks",
    icon: IconBuildingBank,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Banks`,
    description: () => t`Integrate bank accounts to receive and pay money.`,
    color: "yellow",
  }),
  workspacePluginsZaloOas: combineModule({
    href: "/workspace-settings/plugins/zalo-oas",
    icon: IconZalo,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Zalo OAs`,
    description: () => t`Integrate Zalo OA, manage customer interactions.`,
    color: "blue",
  }),
  workspacePluginsMetaPages: combineModule({
    href: "/workspace-settings/plugins/meta-pages",
    icon: IconFacebook,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Meta Pages`,
    description: () => t`Integrate Fanpage Facebook, manage Messenger messages.`,
    color: "blue",
  }),
  workspacePluginsMailer: combineModule({
    href: "/workspace-settings/plugins/mailer",
    icon: IconMailbox,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Mailer`,
    description: () =>
      t`Identify brand through Email. Help you take better care of customers through Email.`,
    color: "orange",
  }),
  workspacePluginsMessageHubs: combineModule({
    href: "/workspace-settings/plugins/message-hubs",
    icon: IconMessage,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`Message Hubs`,
    description: () => t`Integrate ChatBox into your website.`,
    color: "teal",
  }),
  workspacePluginsAiAssistants: combineModule({
    href: "/workspace-settings/plugins/ai-assistants",
    icon: IconAi,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`AI Assistants`,
    description: () => t`Auto reply messages according to the script`,
    color: "indigo",
  }),
  workspacePluginsEInvoices: combineModule({
    href: "/workspace-settings/plugins/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    name: () => t`E-Invoices`,
    description: () => t`Integrate with E-Invoices services: MatBao, ...`,
    color: "yellow",
  }),

  // Profile
  profileSettings: combineModule({
    href: "/profile/settings",
    icon: IconSettings,
    restrictDisplay: ["spotlight"],
    name: () => t`Profile Settings`,
    description: () => t`Manage your profile settings`,
    color: "primary",
  }),

  // Reports
  reports: combineModule({
    href: "/reports",
    icon: IconReportAnalytics,
    permissions: WorkspacePermission.REPORTS_VIEW,
    name: () => t`Reports`,
    description: () => t`View reports and analytics`,
    color: "teal",
  }),
};

export type WorkspaceModuleId = keyof typeof workspaceModuleConfigs;

export const getWorkspaceModuleName = (id: WorkspaceModuleId) => {
  return workspaceModuleConfigs[id].name;
};
