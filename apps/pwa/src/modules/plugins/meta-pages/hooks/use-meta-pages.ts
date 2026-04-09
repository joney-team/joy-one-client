import { useQuery } from "@apollo/client/react";
import GetMetaPagesDocument from "../graphql/getMetaPages.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";

export const useMetaPages = () => {
  const { data, loading, error, refetch } = useQuery(GetMetaPagesDocument);

  useEventsListener(
    [EventType.PluginMetaPagesUpdated, EventType.PluginMetaPagesDisconnected],
    () => refetch(),
    [],
  );

  return {
    metaPages: data?.getMetaPages ?? [],
    loading: loading && !data,
    error,
  };
};
