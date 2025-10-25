"use client";

import { useRouter } from "@/hooks/use-router";
import { OnConnectMetaPagesModal } from "@/modals/modal-connect-meta-pages";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { onFacebookLogin } from "@/modules/auth/auth-service";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getClientLocale, tl } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onErrorLog } from "@/utils/exceptions.utils";
import { parseThemeColor, useMantineTheme } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { getPluginAiAssistants } from "./ai-assistants/plugin-ai-assistants-service";
import { PluginAiAssistantEntity } from "./ai-assistants/plugin-ai-assistants-types";
import { createPluginMessageHub, getPluginMessageHubs } from "./message-hubs/message-hubs-service";
import { PluginMessageHubEntity } from "./message-hubs/message-hubs-types";
import { getPluginMetaPages, getPluginMetaPagesInfo } from "./meta-pages/meta-pages-service";
import { PluginMetaPageEntity } from "./meta-pages/meta-pages-types";
import { Context } from "./plugins-context";
import { getPluginZaloOas, getZnsTemplateConfigs } from "./zalo-oas/zalo-oas-service";
import { PluginZaloOaEntity, ZnsTemplateConfigs } from "./zalo-oas/zalo-oas-types";
import { Plugin } from "./plugins-types";

const PluginsProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const router = useRouter();
  const parsedPrimaryColor = parseThemeColor({
    color: workspace.userMember?.workspace.appColor || "primary",
    theme,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [messageHubs, setMessageHubs] = useState<PluginMessageHubEntity[]>([]);
  const [zaloOas, setZaloOas] = useState<PluginZaloOaEntity[]>([]);
  const [metaPages, setMetaPages] = useState<PluginMetaPageEntity[]>([]);
  const [znsTemplateConfigs, setZnsTemplateConfigs] = useState<ZnsTemplateConfigs>(
    {} as ZnsTemplateConfigs
  );
  const [aiAssistants, setAiAssistants] = useState<PluginAiAssistantEntity[]>([]);

  const fetchMessageHubs = async () => {
    await getPluginMessageHubs()
      .then((r) => setMessageHubs(r.data))
      .catch(onErrorLog);
  };

  const fetchZaloOas = async () => {
    await getPluginZaloOas()
      .then((res) => setZaloOas(res.data))
      .catch(onErrorLog);
  };

  const fetchMetaPages = async () => {
    return getPluginMetaPages()
      .then((res) => setMetaPages(res.data))
      .catch(onErrorLog);
  };

  const fetchZnsTemplateConfigs = async () => {
    return getZnsTemplateConfigs().then(setZnsTemplateConfigs).catch(onErrorLog);
  };

  const fetchAiAssistants = async () => {
    return getPluginAiAssistants({ getAll: true })
      .then((res) => setAiAssistants(res.data))
      .catch(onErrorLog);
  };

  const fetch = async () => {
    await Promise.all([
      fetchMessageHubs(),
      fetchZaloOas(),
      fetchMetaPages(),
      fetchZnsTemplateConfigs(),
      fetchAiAssistants(),
    ]);

    setIsInitialized(true);
  };

  const onCreateMessageHub = () => {
    OnModalInput({
      type: InputModalType.TEXT,
      title: tl("enter_name"),
      icon: IconMessage,
      value: workspace.userMember.name,
      onDone: async (name) => {
        if (!name || name.length === 0) return;
        await createPluginMessageHub({
          name,
          widgetSettings: {
            color: parsedPrimaryColor.value,
            brandName: workspace.userMember.workspace.name,
            brandLogo: workspace.userMember.workspace.logo,
            locale: workspace.userMember.workspace.locale || getClientLocale(),
            position: "right",
            welcomMessage: tl("welcome_message_placeholder", {
              workspaceName: workspace.userMember.workspace.name,
            }),
            welcomSubMessage: tl("welcomSubMessage_placeholder"),
            welcomeInputs: [
              {
                id: uuid(),
                type: "name",
                label: tl("input_name_label_placeholder"),
                description: tl("input_name_desc_placeholder"),
                isRequired: true,
              },
            ],
          },
        });
        router.push(`/workspace-settings/plugins/message-hubs`);
      },
    });
  };

  const onConnectMetaPages = async () => {
    const authResponse = await onFacebookLogin();
    const { pages } = await getPluginMetaPagesInfo(authResponse.accessToken);
    OnConnectMetaPagesModal({ pages, accessToken: authResponse.accessToken });
  };

  useEventsListener(
    [
      EventType.PLUGIN_MESSAGE_HUBS_NEW,
      EventType.PLUGIN_MESSAGE_HUBS_UPDATED,
      EventType.PLUGIN_MESSAGE_HUBS_REMOVED,
    ],
    () => fetchMessageHubs(),
    [workspace.userMember?.workspaceId]
  );

  useEventsListener(
    [
      EventType.PLUGIN_AI_ASSISTANTS_NEW,
      EventType.PLUGIN_AI_ASSISTANTS_UPDATED,
      EventType.PLUGIN_AI_ASSISTANTS_REMOVED,
    ],
    () => fetchAiAssistants(),
    [workspace.userMember?.workspaceId]
  );

  useEventsListener(
    [
      EventType.PLUGIN_ZALO_OA_ACTIVE,
      EventType.PLUGIN_ZALO_OA_INACTIVE,
      EventType.PLUGIN_ZALO_OA_UPDATED,
      EventType.PLUGIN_ZALO_OA_ENABLED,
      EventType.PLUGIN_ZALO_OA_DISABLED,
    ],
    () => fetchZaloOas(),
    [workspace.userMember?.workspaceId]
  );

  useEventsListener(
    [EventType.PLUGIN_META_PAGES_UPDATED, EventType.PLUGIN_META_PAGES_DISCONNECTED],
    () => fetchMetaPages(),
    [workspace.userMember?.workspaceId]
  );

  useEffect(() => {
    if (workspace.userMember?.workspaceId) fetch();
  }, [workspace.userMember?.workspaceId]);

  const isHasPlugin = messageHubs.length > 0 || zaloOas.length > 0 || metaPages.length > 0;
  const plugins: Plugin[] = [
    ...metaPages.map((p) => {
      const plugin: Plugin = {
        type: "metaPages",
        id: p.id,
        name: p.name,
      };
      return plugin;
    }),
    ...zaloOas.map((p) => {
      const plugin: Plugin = {
        type: "zaloOas",
        id: p.id,
        name: p.info.name,
      };
      return plugin;
    }),
    ...messageHubs.map((p) => {
      const plugin: Plugin = {
        type: "messageHubs",
        id: p._id,
        name: p.name,
      };
      return plugin;
    }),
  ];

  const getPlugin = (id: string | null | undefined) => plugins.find((p) => p.id === id) ?? null;

  return (
    <Context.Provider
      value={{
        messageHubs,
        zaloOas,
        metaPages,
        isInitialized,
        isHasPlugin,
        onCreateMessageHub,
        znsTemplateConfigs,
        onConnectMetaPages,
        aiAssistants,
        plugins,
        getPlugin,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default PluginsProvider;
