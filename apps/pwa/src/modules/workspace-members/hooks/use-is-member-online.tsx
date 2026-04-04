"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useApolloClient, useQuery } from "@apollo/client/react";
import GetWorkspaceMembersOnlineStatusDocument, {
  GetWorkspaceMembersOnlineStatusQuery,
} from "./getWorkspaceMembersOnlineStatus.graphql";

export const useMemberOnlineEventHandler = () => {
  const client = useApolloClient();

  useEventsListener(EventType.WorkspaceMemberOnline, (event) => {
    if (!event.userId) return;
    client.cache.updateQuery(
      {
        query: GetWorkspaceMembersOnlineStatusDocument,
      },
      (prev) => {
        if (!prev) return prev;

        const memberOnlineStatus: GetWorkspaceMembersOnlineStatusQuery["workspaceMembersOnlineStatus"][number] =
          {
            __typename: "WorkspaceMemberOnlineStatus",
            userId: event.userId!,
            isOnline: true,
          };

        return {
          ...prev,
          workspaceMembersOnlineStatus: [
            ...prev.workspaceMembersOnlineStatus.filter((v) => v.userId !== event.userId),
            memberOnlineStatus,
          ],
        };
      },
    );
  });

  useEventsListener(EventType.WorkspaceMemberOffline, (event) => {
    if (!event.userId) return;
    client.cache.updateQuery(
      {
        query: GetWorkspaceMembersOnlineStatusDocument,
      },
      (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          workspaceMembersOnlineStatus: prev.workspaceMembersOnlineStatus.filter(
            (v) => v.userId !== event.userId,
          ),
        };
      },
    );
  });
};

export const useIsOnline = (userId: string): boolean => {
  const { data } = useQuery(GetWorkspaceMembersOnlineStatusDocument, {
    skip: !userId || userId.length === 0,
  });

  return (
    !!data &&
    data.workspaceMembersOnlineStatus.some((status) => status.userId === userId && status.isOnline)
  );
};
