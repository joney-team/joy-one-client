import { PluginAiAssistantFragment } from "./ai-assistants/graphql/fragmentPluginAiAssistant.graphql";
import { PluginMessageHubFragment } from "./message-hubs/graphql/fragmentPluginMessageHub.graphql";
import { MetaPageFragment } from "./meta-pages/graphql/fragmentMetaPage.graphql";
import { ZaloOaFragment } from "./zalo-oas/graphql/fragmentZaloOa.graphql";
import { ZnsTemplateConfigs } from "./zalo-oas/zalo-oas-types";

export interface Plugin {
  type: "metaPages" | "zaloOas" | "messageHubs" | "aiAssistants";
  id: string;
  name: string;
}

export interface UsePlugins {
  isInitialized: boolean;
  messageHubs: PluginMessageHubFragment[];
  zaloOas: ZaloOaFragment[];
  metaPages: MetaPageFragment[];
  znsTemplateConfigs: ZnsTemplateConfigs;
  aiAssistants: PluginAiAssistantFragment[];
  onCreateMessageHub: (name: string) => Promise<void>;
  plugins: Plugin[];
  getPlugin: (id: string | null | undefined) => Plugin | null;
  isHasPlugin: boolean;
}
