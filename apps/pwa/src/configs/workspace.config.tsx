import type { WorkspaceSettingCardProps } from "@/modules/workspace-settings/components/workspace-setting-card";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import {
  IconSettings2,
  IconLayout,
  IconActivityHeartbeat,
  IconWorld,
  IconCalendarCheck,
  IconFiles,
  IconCreditCardPay,
  IconBuilding,
  IconPuzzle,
  IconApiApp,
  IconMessage2Cog,
  IconAccessible,
} from "@tabler/icons-react";

export const workspaceSettingNavs: WorkspaceSettingCardProps[] = [
  {
    name: "general_settings",
    description: "general_settings_desc",
    icon: IconSettings2,
    color: "primary",
    href: "/workspace-settings/general",
  },
  {
    name: "setting_modules",
    description: "setting_modules_desc",
    icon: IconLayout,
    color: "teal",
    href: "/workspace-settings/modules",
  },
  {
    name: "operation_settings",
    description: "operation_settings_desc",
    icon: IconActivityHeartbeat,
    color: "grape",
    href: "/workspace-settings/operation",
  },
  {
    name: "custom_domain",
    description: "custom_domain_desc",
    icon: IconWorld,
    color: "blue",
    href: "/workspace-settings/app",
  },
  {
    name: "hrm_timekeepings_name",
    description: "hrm_timekeepings_desc",
    icon: IconCalendarCheck,
    color: "violet",
    href: "/workspace-settings/hrm-timekeepings",
  },
  {
    name: "documents",
    description: "documents_desc",
    icon: IconFiles,
    color: "lime",
    href: "/workspace-settings/documents",
  },
  {
    name: "credit_settings",
    description: "credit_settings_desc",
    icon: IconCreditCardPay,
    color: "yellow",
    href: "/workspace-settings/credit",
    workspaceTypes: [WorkspaceType.CREDIT],
  },
  {
    name: "workspace_branches",
    description: "workspace_branches_desc",
    icon: IconBuilding,
    color: "blue",
    href: "/workspace-settings/branches",
  },
  {
    name: "plugins",
    description: "plugins_desc",
    icon: IconPuzzle,
    color: "lime",
    href: "/workspace-settings/plugins",
  },
  {
    name: "workspaceSettingsApiApps",
    description: "workspaceSettingsApiAppsDesc",
    icon: IconApiApp,
    color: "teal",
    href: "/workspace-settings/api-apps",
  },
  {
    name: "workspaceSettingsMessages",
    description: "workspaceSettingsMessagesDesc",
    icon: IconMessage2Cog,
    color: "yellow",
    href: "/workspace-settings/messages",
  },
  {
    name: "member_roles",
    description: "member_roles_desc",
    icon: IconAccessible,
    color: "orange",
    href: "/workspace-settings/roles",
  },
];

export const workspacePluginNavs: WorkspaceSettingCardProps[] = [
  {
    name: "Facebook",
    description: "plugin_facebook_desc",
    image: "/images/plugins-meta-pages.png",
    href: "/workspace-settings/plugins/meta-pages",
  },
  {
    name: "Zalo OAs",
    description: "plugin_zalo_oas_desc",
    image: "/images/plugins-zalo-oa.png",
    href: "/workspace-settings/plugins/zalo-oas",
  },
  {
    name: "Message Hubs",
    description: "plugin_message_hubs_desc",
    image: "/images/plugins-message-hubs.png",
    href: "/workspace-settings/plugins/message-hubs",
  },
  {
    name: "Mailer",
    description: "plugin_mailer_desc",
    image: "/images/mailers.png",
    href: "/workspace-settings/plugins/mailer",
  },
  {
    name: "banks",
    description: "plugin_bank_desc",
    image: "/images/bank.png",
    href: "/workspace-settings/plugins/banks",
  },
  {
    name: "SDKs",
    description: "plugin_sdk_desc",
    image: "/images/sdks.png",
    href: "/plugins/sdks",
  },
  {
    name: "ai-assistants",
    description: "plugin_ai_assistants_desc",
    image: "/images/ai-assistants.png",
    href: "/plugins/ai-assistants",
  },
];
