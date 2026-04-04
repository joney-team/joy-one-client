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
  IconCloudDataConnection,
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

import { useMemo } from "react";

import { IconFacebook, IconZalo } from "@/components/icons";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { MantineColor } from "@mantine/core";
import { usePathname } from "next/navigation";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "./workspace-context";

export interface WorkspaceModuleConfig {
  name: MacroMessageDescriptor;
  description?: MacroMessageDescriptor;
  color?: MantineColor;

  href: string;
  hrefExact?: boolean;

  icon: any;
  isBeta?: boolean;
  restrictDisplay?: ("navigation" | "spotlight")[];

  permissions?: WorkspacePermission | WorkspacePermission[];
  workspaceTypes?: WorkspaceType[];
}

export interface WorkspaceModule extends Omit<WorkspaceModuleConfig, "name" | "description"> {
  id: WorkspaceModuleId;
  name: string;
  description?: string;
}

const combineModule = (config: WorkspaceModuleConfig): WorkspaceModuleConfig => {
  return config;
};

export const workspaceModuleConfigs = {
  // Main
  dashboard: combineModule({
    href: "/",
    icon: IconLayoutDashboard,
    hrefExact: true,
    name: defineMessage`Dashboard`,
  }),

  // Posts
  posts: combineModule({
    href: "/posts",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_VIEW,
    name: defineMessage`Posts`,
  }),
  postsNew: combineModule({
    href: "/posts/new",
    icon: IconNews,
    permissions: WorkspacePermission.POSTS_MANAGER,
    restrictDisplay: ["spotlight"],
    name: defineMessage`New Post`,
  }),

  // Promotions
  promotions: combineModule({
    href: "/promotions",
    icon: IconRosetteDiscount,
    permissions: WorkspacePermission.PROMOTIONS_VIEW,
    name: defineMessage`Promotions`,
  }),

  // HRM
  members: combineModule({
    href: "/members",
    icon: IconUsersGroup,
    restrictDisplay: ["spotlight"],
    permissions: WorkspacePermission.WORKSPACE_MEMBERS_VIEW,
    name: defineMessage`Members`,
  }),
  attendance: combineModule({
    href: "/attendance",
    icon: IconCalendarCheck,
    name: defineMessage`Attendance`,
  }),

  // Customers
  customers: combineModule({
    href: "/customers",
    icon: IconUserSquareRounded,
    permissions: WorkspacePermission.CUSTOMERS_VIEW,
    name: defineMessage`Customers`,
  }),
  customerForms: combineModule({
    href: "/customer-forms",
    icon: IconMessageUser,
    permissions: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
    name: defineMessage`Customer Forms`,
  }),
  customerKYCs: combineModule({
    href: "/customer-kycs",
    icon: IconUserScan,
    permissions: WorkspacePermission.CUSTOMER_KYCS_MANAGER,
    workspaceTypes: [WorkspaceType.Credit],
    name: defineMessage`KYCs`,
  }),
  bookings: combineModule({
    href: "/bookings",
    icon: IconCalendar,
    permissions: WorkspacePermission.BOOKING_VIEW,
    name: defineMessage`Bookings`,
  }),
  messageBoxes: combineModule({
    href: "/message-boxes",
    icon: IconMessageCircle,
    permissions: WorkspacePermission.MESSAGE_BOXES_MANAGER,
    name: defineMessage`Message Boxes`,
  }),

  // Products
  products: combineModule({
    href: "/products",
    icon: IconBox,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
    name: defineMessage`Products`,
  }),
  productServices: combineModule({
    href: "/services",
    icon: IconCategory2,
    permissions: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
    name: defineMessage`Services`,
  }),
  productStocks: combineModule({
    href: "/product-stocks",
    icon: IconBuildingWarehouse,
    permissions: WorkspacePermission.PRODUCT_STOCK_VIEW,
    name: defineMessage`Stocks`,
  }),
  productCombos: combineModule({
    href: "/combos",
    icon: IconPackage,
    permissions: WorkspacePermission.PRODUCT_COMBOS_VIEW,
    name: defineMessage`Combos`,
  }),

  partners: combineModule({
    href: "/partners",
    icon: IconTopologyStar3,
    permissions: WorkspacePermission.PARTNERS_WRITE,
    name: defineMessage`Partners`,
  }),
  prescriptions: combineModule({
    href: "/prescriptions",
    icon: IconPill,
    workspaceTypes: [WorkspaceType.Dental, WorkspaceType.Clinic, WorkspaceType.Hospital],
    name: defineMessage`Prescriptions`,
  }),

  // Business
  tasks: combineModule({
    href: "/tasks",
    icon: IconStack2,
    name: defineMessage`Tasks`,
  }),
  orders: combineModule({
    href: "/orders",
    icon: IconClipboardText,
    permissions: WorkspacePermission.ORDERS_VIEW,
    name: defineMessage`Orders`,
  }),
  receipts: combineModule({
    href: "/receipts",
    icon: IconCashRegister,
    permissions: WorkspacePermission.RECEIPTS_VIEW,
    name: defineMessage`Receipts`,
  }),
  eInvoices: combineModule({
    href: "/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE,
    name: defineMessage`E-Invoices`,
  }),

  // Credit
  loans: combineModule({
    href: "/loans",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.LOANS_VIEW,
    name: defineMessage`Loans`,
  }),
  loanAssetEstimations: combineModule({
    href: "/loan-asset-estimations",
    icon: IconCoins,
    permissions: WorkspacePermission.LOANS_VIEW,
    name: defineMessage`Loan Asset Estimations`,
  }),

  // Workspace Settings
  workspaceSettings: combineModule({
    href: "/workspace-settings",
    icon: IconSettings,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    description: defineMessage`Manage the settings of the Workspace`,
    color: "primary",
    name: defineMessage`Workspace Settings`,
  }),
  workspaceSettingsGeneral: combineModule({
    href: "/workspace-settings/general",
    icon: IconSettings2,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "primary",
    name: defineMessage`General Settings`,
    description: defineMessage`Set name, address, Hotline, Workspace type, ...`,
  }),
  workspaceSettingsModules: combineModule({
    href: "/workspace-settings/modules",
    icon: IconLayout,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "teal",
    name: defineMessage`Modules`,
    description: defineMessage`Customize the features needed on the navigation bar`,
  }),
  workspaceSettingsOperation: combineModule({
    href: "/workspace-settings/operation",
    icon: IconActivityHeartbeat,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "grape",
    name: defineMessage`Operation settings`,
    description: defineMessage`Working time, invoice, payment method, search settings, ...`,
  }),
  workspaceSettingsApp: combineModule({
    href: "/workspace-settings/app",
    icon: IconWorld,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "blue",
    name: defineMessage`App settings`,
    description: defineMessage`Create an application with a custom domain, customize the application name, icon, color.`,
  }),
  workspaceSettingsDocuments: combineModule({
    href: "/workspace-settings/documents",
    icon: IconFiles,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "lime",
    name: defineMessage`Documents`,
    description: defineMessage`Terms of use, privacy policy, user manual, ...`,
  }),
  workspaceSettingsCredit: combineModule({
    href: "/workspace-settings/credit",
    icon: IconCreditCardPay,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    workspaceTypes: [WorkspaceType.Credit],
    restrictDisplay: ["spotlight"],
    color: "yellow",
    name: defineMessage`Credit settings`,
    description: defineMessage`Set loan package, interest, late payment penalty, ...`,
  }),
  workspaceSettingsBranches: combineModule({
    href: "/workspace-settings/branches",
    icon: IconBuildingSkyscraper,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "blue",
    name: defineMessage`Branches`,
    description: defineMessage`Manage the branches of the Workspace`,
  }),
  workspaceSettingsRoles: combineModule({
    href: "/workspace-settings/roles",
    icon: IconAccessible,
    permissions: WorkspacePermission.WORKSPACE_ROLES_MANAGER,
    restrictDisplay: ["spotlight"],
    color: "orange",
    name: defineMessage`Roles`,
    description: defineMessage`Manage member roles and access permissions`,
  }),

  workspaceSettingsApiApps: combineModule({
    href: "/workspace-settings/api-apps",
    icon: IconApiApp,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "teal",
    name: defineMessage`API Apps`,
    description: defineMessage`For developers, manipulate data through APIs`,
  }),
  workspaceSettingsMessages: combineModule({
    href: "/workspace-settings/messages",
    icon: IconMessage2Cog,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "yellow",
    name: defineMessage`Messages settings`,
    description: defineMessage`Summarize customer messages from various channels: Zalo, Facebook, Landing Page, ...`,
  }),
  workspaceSettingsCategories: combineModule({
    href: "/workspace-settings/categories",
    icon: IconCategory,
    permissions: WorkspacePermission.CATEGORIES_MANAGER,
    restrictDisplay: ["spotlight"],
    color: "teal",
    name: defineMessage`Categories`,
    description: defineMessage`Manage product, service, post, ...`,
  }),
  workspaceSettingsCustomFields: combineModule({
    href: "/workspace-settings/custom-fields",
    icon: IconForms,
    permissions: WorkspacePermission.CUSTOM_FIELDS_MANAGER,
    restrictDisplay: ["spotlight"],
    color: "orange",
    name: defineMessage`Custom fields`,
    description: defineMessage`Manage custom fields for objects: product, service, post, ...`,
  }),
  workspaceSettingsFileManager: combineModule({
    href: "/workspace-settings/file-manager",
    icon: IconFolderRoot,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "blue",
    name: defineMessage`File manager`,
    description: defineMessage`Summarize images / documents / files, ...`,
  }),

  // Workspace Setting Plugins
  workspacePlugins: combineModule({
    href: "/workspace-settings/plugins",
    icon: IconPuzzle,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    color: "lime",
    name: defineMessage`Plugins`,
    description: defineMessage`Integrate other services / utilities`,
  }),
  workspacePluginsBanks: combineModule({
    href: "/workspace-settings/plugins/banks",
    icon: IconBuildingBank,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "yellow",
    name: defineMessage`Banks`,
    description: defineMessage`Integrate bank accounts to receive and pay money.`,
  }),
  workspacePluginsZaloOas: combineModule({
    href: "/workspace-settings/plugins/zalo-oas",
    icon: IconZalo,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    description: defineMessage`Integrate Zalo OA, manage customer interactions.`,
    color: "blue",
    name: defineMessage`Zalo OAs`,
  }),
  workspacePluginsMetaPages: combineModule({
    href: "/workspace-settings/plugins/meta-pages",
    icon: IconFacebook,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "blue",
    name: defineMessage`Meta Pages`,
    description: defineMessage`Integrate Fanpage Facebook, manage Messenger messages.`,
  }),
  workspacePluginsMailer: combineModule({
    href: "/workspace-settings/plugins/mailer",
    icon: IconMailbox,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "orange",
    name: defineMessage`Mailer`,
    description: defineMessage`Identify brand through Email. Help you take better care of customers through Email.`,
  }),
  workspacePluginsMessageHubs: combineModule({
    href: "/workspace-settings/plugins/message-hubs",
    icon: IconMessage,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "teal",
    name: defineMessage`Message Hubs`,
    description: defineMessage`Integrate ChatBox into your website.`,
  }),
  workspacePluginsAiAssistants: combineModule({
    href: "/workspace-settings/plugins/ai-assistants",
    icon: IconAi,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "indigo",
    name: defineMessage`AI Assistants`,
    description: defineMessage`Auto reply messages according to the script`,
  }),
  workspacePluginsEInvoices: combineModule({
    href: "/workspace-settings/plugins/e-invoices",
    icon: IconFileInvoice,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "yellow",
    name: defineMessage`E-Invoices`,
    description: defineMessage`Integrate with E-Invoices services: MatBao, ...`,
  }),
  workspacePluginsStorage: combineModule({
    href: "/workspace-settings/plugins/storage",
    icon: IconCloudDataConnection,
    permissions: WorkspacePermission.WORKSPACE_SETTINGS,
    restrictDisplay: ["spotlight"],
    color: "blue",
    name: defineMessage`Cloud Storage`,
    description: defineMessage`Integrate with cloud storage services: S3, ...`,
  }),

  // Profile
  profileSettings: combineModule({
    href: "/profile/settings",
    icon: IconSettings,
    restrictDisplay: ["spotlight"],
    color: "primary",
    name: defineMessage`Profile settings`,
    description: defineMessage`Manage your profile settings`,
  }),

  // Reports
  reports: combineModule({
    href: "/reports",
    icon: IconReportAnalytics,
    permissions: WorkspacePermission.REPORTS_VIEW,
    color: "teal",
    name: defineMessage`Reports`,
    description: defineMessage`View reports and analytics`,
  }),
};

export type WorkspaceModuleId = keyof typeof workspaceModuleConfigs;

export const useWorkspaceModules = () => {
  const { i18n, t } = useLingui();

  const workspaceModules = useMemo<WorkspaceModule[]>(() => {
    return Object.entries(workspaceModuleConfigs).map(([id, mo]) => ({
      ...mo,
      id: id as WorkspaceModuleId,
      name: t(mo.name),
      description: mo.description ? t(mo.description) : undefined,
    }));
  }, [i18n.locale]);

  return {
    workspaceModules,
    getModule: (id: string) => workspaceModules.find((m) => m.id === id),
    getModuleByHref: (href: string) => workspaceModules.find((m) => m.href === href),
  };
};

export const useAvailableWorkspaceModules = () => {
  const { member, hasPermission } = useWorkspace();
  const { workspaceModules, ...rest } = useWorkspaceModules();

  const availableModules = useMemo(() => {
    return workspaceModules.filter((m) => {
      const isAbleToAccess =
        !m.permissions ||
        m.permissions
          .toString()
          .split(",")
          .every((p) => hasPermission(p as WorkspacePermission));

      const isAvailableType =
        !m.workspaceTypes ||
        m.workspaceTypes.includes(member?.workspace?.type || WorkspaceType.Business);

      return isAbleToAccess && isAvailableType;
    });
  }, [hasPermission, member?.workspace?.type]);

  return {
    availableModules,
    isModuleAvailable: (id: WorkspaceModuleId) => availableModules.some((m) => m.id === id),
    getAvailableModule: (id: WorkspaceModuleId) => availableModules.find((m) => m.id === id),
    ...rest,
  };
};

export const useActivatedWorkspaceModule = () => {
  const { workspaceModules } = useWorkspaceModules();
  const pathname = usePathname();

  return workspaceModules.find(
    (m) => pathname === m.href || (pathname.startsWith(m.href) && !m.hrefExact),
  );
};
