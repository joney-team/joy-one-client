import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useQuery } from "@apollo/client/react";
import GetZaloOasDocument from "../graphql/getZaloOas.graphql";
import GetZaloZnsTemplateConfigsDocument from "../graphql/getZaloZnsTemplateConfigs.graphql";
import { ZnsTemplateConfigs } from "../zalo-oas-types";

export const useZnsTemplateConfigs = () => {
  const { data, loading, refetch } = useQuery(GetZaloZnsTemplateConfigsDocument);

  return {
    znsTemplateConfigs: data?.getZaloZnsTemplateConfigs || ({} as ZnsTemplateConfigs),
    loading,
    refetch,
  };
};

export const useZaloOas = () => {
  const { data, loading, refetch } = useQuery(GetZaloOasDocument);

  useEventsListener(
    [
      EventType.PluginZaloOaActive,
      EventType.PluginZaloOaInactive,
      EventType.PluginZaloOaUpdated,
      EventType.PluginZaloOaEnabled,
      EventType.PluginZaloOaDisabled,
    ],
    () => refetch(),
  );

  return {
    zaloOas: data?.getZaloOas || [],
    loading: loading && !data,
  };
};
