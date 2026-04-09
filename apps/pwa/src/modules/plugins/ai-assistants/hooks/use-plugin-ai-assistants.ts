"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useQuery } from "@apollo/client/react";
import GetPluginAiAssistantsDocument from "../graphql/getPluginAiAssistants.graphql";

export const usePluginAiAssistants = () => {
  const { refetch, data, loading } = useQuery(GetPluginAiAssistantsDocument);

  useEventsListener(
    [
      EventType.PluginAiAssistantsNew,
      EventType.PluginAiAssistantsUpdated,
      EventType.PluginAiAssistantsRemoved,
    ],
    () => {
      refetch();
    },
  );

  return {
    aiAssistants: data?.getPluginAiAssistants.results ?? [],
    loading: loading && !data,
  };
};
