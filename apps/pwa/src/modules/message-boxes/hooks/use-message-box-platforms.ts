"use client";

import { useQuery } from "@apollo/client/react";
import GetMessageBoxPlatformsDocument from "../graphql/getMessageBoxPlatforms.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { useMemo } from "react";

export const useMessageBoxPlatforms = () => {
  const { data, refetch, loading } = useQuery(GetMessageBoxPlatformsDocument);

  useEventsListener([EventType.MessageBoxesPlatformsUpdated], () => {
    refetch();
  });

  return {
    platforms: data?.platforms || [],
    loading,
  };
};

export const useMessageBoxPlatform = (platformId: string | null | undefined) => {
  const { platforms, loading } = useMessageBoxPlatforms();

  const platform = useMemo(() => {
    return platforms.find((p) => p.id === platformId) || null;
  }, [platforms, platformId]);

  return {
    platform,
    loading,
  };
};
