import type { WorkspaceSettingCardProps } from "@/modules/workspace-settings/components/workspace-setting-card";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";

export const workspaceSettingCards: WorkspaceSettingCardProps[] = [
  {
    moduleId: "workspaceSettingsGeneral",
    description: "general_settings_desc",
    color: "primary",
  },
  {
    moduleId: "workspaceSettingsModules",
    description: "setting_modules_desc",
    color: "teal",
  },
  {
    moduleId: "workspaceSettingsOperation",
    description: "operation_settings_desc",
    color: "grape",
  },
  {
    moduleId: "workspaceSettingsApp",
    description: "custom_domain_desc",
    color: "blue",
  },
  {
    moduleId: "workspaceSettingsHrmTimekeepings",
    description: "hrm_timekeepings_desc",
    color: "violet",
  },
  {
    moduleId: "workspaceSettingsDocuments",
    description: "documents_desc",
    color: "lime",
  },
  {
    moduleId: "workspaceSettingsCredit",
    description: "credit_settings_desc",
    color: "yellow",
    workspaceTypes: [WorkspaceType.CREDIT],
  },
  {
    moduleId: "workspaceSettingsBranches",
    description: "workspace_branches_desc",
    color: "blue",
  },
  {
    moduleId: "workspacePlugins",
    description: "plugins_desc",
    color: "lime",
  },
  {
    moduleId: "workspaceSettingsApiApps",
    description: "workspaceSettingsApiAppsDesc",
    color: "teal",
  },
  {
    moduleId: "workspaceSettingsMessages",
    description: "workspaceSettingsMessagesDesc",
    color: "yellow",
  },
  {
    moduleId: "workspaceSettingsRoles",
    description: "member_roles_desc",
    color: "orange",
  },
  {
    moduleId: "workspaceSettingsCategories",
    description: "categories_desc",
    color: "teal",
  },
  {
    moduleId: "workspaceSettingsCustomFields",
    description: "workspaceSettingsCustomFieldsDesc",
    color: "orange",
  },
];

export const workspacePluginCards: WorkspaceSettingCardProps[] = [
  {
    name: "Facebook",
    description: "plugin_facebook_desc",
    image: "/images/plugins-meta-pages.png",
    moduleId: "workspacePluginsMetaPages",
  },
  {
    name: "Zalo OAs",
    description: "plugin_zalo_oas_desc",
    image: "/images/plugins-zalo-oa.png",
    moduleId: "workspacePluginsZaloOas",
  },
  {
    name: "Message Hubs",
    description: "plugin_message_hubs_desc",
    image: "/images/plugins-message-hubs.png",
    moduleId: "workspacePluginsMessageHubs",
  },
  {
    name: "Mailer",
    description: "plugin_mailer_desc",
    image: "/images/mailers.png",
    moduleId: "workspacePluginsMailer",
  },
  {
    name: "banks",
    description: "plugin_bank_desc",
    image: "/images/bank.png",
    moduleId: "workspacePluginsBanks",
  },
  {
    name: "ai-assistants",
    description: "plugin_ai_assistants_desc",
    image: "/images/ai-assistants.png",
    moduleId: "workspacePluginsAiAssistants",
  },
];
