"use client";

import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { useApolloClient } from "@apollo/client/react";
import { ActivityFragment } from "./graphql/fragmentActivity.graphql";
import ACTIVITY_QUERY, {
  type ActivityQuery,
  type ActivityQueryVariables,
} from "./graphql/queryActivity.graphql";
import ACTIVITY_FRAGMENT from "./graphql/fragmentActivity.graphql";

export const ActivitiesEvents: FC = () => {
  const client = useApolloClient();

  useEventsListener(
    [EventType.ActivityUpdated, EventType.ActivitySynced],
    async (ev) => {
      if (!ev.ref) return;

      const activityData = await client.query<ActivityQuery, ActivityQueryVariables>({
        query: ACTIVITY_QUERY,
        variables: {
          id: ev.ref,
        },
        fetchPolicy: "network-only",
      });

      if (activityData.data?.activity) {
        const identifiedId = client.cache.identify({
          __typename: "Activity",
          _id: activityData.data?.activity._id,
        });

        client.cache.updateFragment<ActivityFragment>(
          {
            id: identifiedId,
            fragment: ACTIVITY_FRAGMENT,
            fragmentName: "Activity",
          },
          (prev) => activityData.data?.activity ?? prev,
        );
      }
    },
    [],
  );

  return null;
};
