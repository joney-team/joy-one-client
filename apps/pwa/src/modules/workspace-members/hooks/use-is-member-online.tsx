"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useApolloClient, useQuery } from "@apollo/client/react";
import QUERY_WORKSPACE_MEMBERS_ONLINE_STATUS, {
  type WorkspaceMembersOnlineStatusQuery,
  type WorkspaceMembersOnlineStatusQueryVariables,
} from "./queryWorkspaceMembersOnlineStatus.graphql";

export const useMemberOnlineEventHandler = () => {
  const client = useApolloClient();

  useEventsListener(EventType.WorkspaceMemberOnline, (event) => {
    if (!event.userId) return;
    client.cache.updateQuery<
      WorkspaceMembersOnlineStatusQuery,
      WorkspaceMembersOnlineStatusQueryVariables
    >(
      {
        query: QUERY_WORKSPACE_MEMBERS_ONLINE_STATUS,
      },
      (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          workspaceMembersOnlineStatus: [
            ...prev.workspaceMembersOnlineStatus.filter((v) => v.userId !== event.userId),
            {
              __typename: "WorkspaceMemberOnlineStatus",
              userId: event.userId!,
              isOnline: true,
            },
          ],
        };
      }
    );
  });

  useEventsListener(EventType.WorkspaceMemberOffline, (event) => {
    if (!event.userId) return;
    client.cache.updateQuery<
      WorkspaceMembersOnlineStatusQuery,
      WorkspaceMembersOnlineStatusQueryVariables
    >(
      {
        query: QUERY_WORKSPACE_MEMBERS_ONLINE_STATUS,
      },
      (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          workspaceMembersOnlineStatus: prev.workspaceMembersOnlineStatus.filter(
            (v) => v.userId !== event.userId
          ),
        };
      }
    );
  });
};

export const useIsOnline = (userId: string): boolean => {
  const { data } = useQuery<
    WorkspaceMembersOnlineStatusQuery,
    WorkspaceMembersOnlineStatusQueryVariables
  >(QUERY_WORKSPACE_MEMBERS_ONLINE_STATUS, {
    skip: !userId || userId.length === 0,
  });

  return (
    !!data &&
    data.workspaceMembersOnlineStatus.some((status) => status.userId === userId && status.isOnline)
  );
};
