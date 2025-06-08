import { PluginAiAssistantEntity } from "./ai-assistants/ai-assistants-types";
import { PluginMessageHubEntity } from "./message-hubs/message-hubs-types";
import { PluginMetaPageEntity } from "./meta-pages/meta-pages-types";
import { PluginZaloOaEntity, ZnsTemplateConfigs } from "./zalo-oas/zalo-oas-types";

export interface UsePlugins {
  isInitialized: boolean;
  messageHubs: PluginMessageHubEntity[];
  zaloOas: PluginZaloOaEntity[];
  metaPages: PluginMetaPageEntity[];
  znsTemplateConfigs: ZnsTemplateConfigs;
  aiAssistants: PluginAiAssistantEntity[];
  onCreateMessageHub: () => void;
  onConnectMetaPages: () => Promise<void>;
  isHasPlugin: boolean;
}