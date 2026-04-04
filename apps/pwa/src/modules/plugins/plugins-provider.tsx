"use client";

import {
  ChannelWidgetWelcomeInputType,
  EventType,
  MessageHubWidgetPosition,
} from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useEventsListener } from "@/modules/events/event-service";
import { getClientLocale } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onErrorLog } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { parseThemeColor, useMantineTheme } from "@mantine/core";
import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { PluginAiAssistantFragment } from "./ai-assistants/graphql/fragmentPluginAiAssistant.graphql";
import GetPluginAiAssistantsDocument from "./ai-assistants/graphql/getPluginAiAssistants.graphql";
import CreatePluginMessageHubDocument from "./message-hubs/graphql/createPluginMessageHub.graphql";
import { PluginMessageHubFragment } from "./message-hubs/graphql/fragmentPluginMessageHub.graphql";
import GetPluginMessageHubsDocument from "./message-hubs/graphql/getPluginMessageHubs.graphql";
import { MetaPageFragment } from "./meta-pages/graphql/fragmentMetaPage.graphql";
import GetMetaPagesDocument from "./meta-pages/graphql/getMetaPages.graphql";
import { Context } from "./plugins-context";
import { Plugin } from "./plugins-types";
import { ZaloOaFragment } from "./zalo-oas/graphql/fragmentZaloOa.graphql";
import GetZaloOasDocument from "./zalo-oas/graphql/getZaloOas.graphql";
import GetZaloZnsTemplateConfigsDocument from "./zalo-oas/graphql/getZaloZnsTemplateConfigs.graphql";
import { ZnsTemplateConfigs } from "./zalo-oas/zalo-oas-types";

const PluginsProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const client = useApolloClient();
  const router = useRouter();
  const parsedPrimaryColor = parseThemeColor({
    color: workspace.member?.workspace.appColor || "primary",
    theme,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [messageHubs, setMessageHubs] = useState<PluginMessageHubFragment[]>([]);
  const [zaloOas, setZaloOas] = useState<ZaloOaFragment[]>([]);
  const [metaPages, setMetaPages] = useState<MetaPageFragment[]>([]);
  const [znsTemplateConfigs, setZnsTemplateConfigs] = useState<ZnsTemplateConfigs>(
    {} as ZnsTemplateConfigs,
  );
  const [aiAssistants, setAiAssistants] = useState<PluginAiAssistantFragment[]>([]);

  const fetchMessageHubs = async () => {
    await client
      .query({
        query: GetPluginMessageHubsDocument,
      })
      .then((result) => setMessageHubs(result.data?.getPluginMessageHubs ?? []));
  };

  const fetchZaloOas = async () => {
    return client
      .query({
        query: GetZaloOasDocument,
      })
      .then((result) => setZaloOas(result.data?.getZaloOas ?? []))
      .catch(onErrorLog);
  };

  const fetchMetaPages = async () => {
    return client
      .query({
        query: GetMetaPagesDocument,
      })
      .then((res) => setMetaPages(res.data?.getMetaPages ?? []))
      .catch(onErrorLog);
  };

  const fetchZnsTemplateConfigs = async () => {
    return client
      .query({
        query: GetZaloZnsTemplateConfigsDocument,
      })
      .then((result) => setZnsTemplateConfigs(result.data?.getZaloZnsTemplateConfigs ?? {}))
      .catch(onErrorLog);
  };

  const fetchAiAssistants = async () => {
    return client
      .query({
        query: GetPluginAiAssistantsDocument,
        variables: {
          query: { getAll: true },
        },
      })
      .then((result) => setAiAssistants(result.data?.getPluginAiAssistants.results ?? []))
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

  const onCreateMessageHub = async (name: string) => {
    if (!name || name.length === 0) return;

    await client.mutate({
      mutation: CreatePluginMessageHubDocument,
      variables: {
        input: {
          name,
          widgetSettings: {
            color: parsedPrimaryColor.value,
            brandName: workspace.member?.workspace.name ?? "",
            brandLogo: workspace.member?.workspace.logo ?? "",
            locale: getClientLocale(),
            position: MessageHubWidgetPosition.Right,
            welcomMessage: t`Welcome to ${workspace.member?.workspace.name ?? ""}`,
            welcomSubMessage: t`You need advice! Start chatting with us now.`,
            welcomeInputs: [
              {
                id: uuid(),
                type: ChannelWidgetWelcomeInputType.Name,
                fieldName: "name",
                label: t`Your name`,
                description: `Let us call you by your most affectionate name!`,
                isRequired: true,
              },
            ],
          },
        },
      },
    });

    router.push(`/workspace-settings/plugins/message-hubs`);
  };

  useEventsListener(
    [
      EventType.PluginMessageHubsNew,
      EventType.PluginMessageHubsUpdated,
      EventType.PluginMessageHubsRemoved,
    ],
    () => fetchMessageHubs(),
    [workspace.member?.workspaceId],
  );

  useEventsListener(
    [
      EventType.PluginAiAssistantsNew,
      EventType.PluginAiAssistantsUpdated,
      EventType.PluginAiAssistantsRemoved,
    ],
    () => fetchAiAssistants(),
    [workspace.member?.workspaceId],
  );

  useEventsListener(
    [
      EventType.PluginZaloOaActive,
      EventType.PluginZaloOaInactive,
      EventType.PluginZaloOaUpdated,
      EventType.PluginZaloOaEnabled,
      EventType.PluginZaloOaDisabled,
    ],
    () => fetchZaloOas(),
    [workspace.member?.workspaceId],
  );

  useEventsListener(
    [EventType.PluginMetaPagesUpdated, EventType.PluginMetaPagesDisconnected],
    () => fetchMetaPages(),
    [workspace.member?.workspaceId],
  );

  useEffect(() => {
    if (workspace.member?.workspaceId) fetch();
  }, [workspace.member?.workspaceId]);

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
