"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useApolloClient } from "@apollo/client/react";
import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import ACTIVITY_FRAGMENT, { ActivityFragment } from "./graphql/fragmentActivity.graphql";
import GetActivityByIdDocument from "./graphql/getActivityById.graphql";

export const ActivitiesEvents: FC = () => {
  const client = useApolloClient();

  useEventsListener(
    [EventType.ActivityUpdated, EventType.ActivitySynced],
    async (ev) => {
      if (!ev.ref) return;

      const activityData = await client.query({
        query: GetActivityByIdDocument,
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
