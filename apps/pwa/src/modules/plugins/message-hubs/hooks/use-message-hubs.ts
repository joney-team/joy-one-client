import { useQuery } from "@apollo/client/react";
import GetPluginMessageHubsDocument from "../graphql/getPluginMessageHubs.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import {
  ChannelWidgetWelcomeInputType,
  EventType,
  MessageHubWidgetPosition,
} from "@/graphql/enums.graphql";
import CreatePluginMessageHubDocument from "../graphql/createPluginMessageHub.graphql";
import { useRouter } from "next/navigation";
import { parseThemeColor, useMantineTheme } from "@mantine/core";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useLingui } from "@lingui/react/macro";
import { useLang } from "@/modules/lang/lang-context";
import { v4 as uuid } from "uuid";

export const useMessageHubs = () => {
  const { t } = useLingui();
  const { locale } = useLang();
  const { data, loading, error, refetch, client } = useQuery(GetPluginMessageHubsDocument);
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const router = useRouter();
  const parsedPrimaryColor = parseThemeColor({
    color: workspace.member?.workspace.appColor || "primary",
    theme,
  });

  useEventsListener(
    [
      EventType.PluginMessageHubsNew,
      EventType.PluginMessageHubsUpdated,
      EventType.PluginMessageHubsRemoved,
    ],
    () => refetch(),
    [],
  );

  const createMessageHub = async (name: string) => {
    if (!name || name.length === 0) return;

    const workspaceName = workspace.member?.workspace.name ?? "";

    await client.mutate({
      mutation: CreatePluginMessageHubDocument,
      variables: {
        input: {
          name,
          widgetSettings: {
            color: parsedPrimaryColor.value,
            brandName: workspace.member?.workspace.name ?? "",
            brandLogo: workspace.member?.workspace.logo ?? "",
            locale,
            position: MessageHubWidgetPosition.Right,
            welcomMessage: t`Welcome to ${workspaceName}`,
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

  return {
    messageHubs: data?.getPluginMessageHubs ?? [],
    loading,
    error,
    createMessageHub,
  };
};
