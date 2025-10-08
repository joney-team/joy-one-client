import { PluginAiAssistantEntity } from "./ai-assistants/plugin-ai-assistants-types";
import { PluginMessageHubEntity } from "./message-hubs/message-hubs-types";
import { PluginMetaPageEntity } from "./meta-pages/meta-pages-types";
import { PluginZaloOaEntity, ZnsTemplateConfigs } from "./zalo-oas/zalo-oas-types";

export interface Plugin {
  type: "metaPages" | "zaloOas" | "messageHubs" | "aiAssistants";
  id: string;
  name: string;
}

export interface UsePlugins {
  isInitialized: boolean;
  messageHubs: PluginMessageHubEntity[];
  zaloOas: PluginZaloOaEntity[];
  metaPages: PluginMetaPageEntity[];
  znsTemplateConfigs: ZnsTemplateConfigs;
  aiAssistants: PluginAiAssistantEntity[];
  onCreateMessageHub: () => void;
  onConnectMetaPages: () => Promise<void>;
  plugins: Plugin[];
  getPlugin: (id: string | null | undefined) => Plugin | null;
  isHasPlugin: boolean;
}
