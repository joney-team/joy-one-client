"use client";

import { useQuery } from "@apollo/client/react";
import { Group, Stack } from "@mantine/core";
import { type FC } from "react";
import { ActivitiesInput } from "./activities-input";
import { ActivitiesProps } from "./activities-types";
import QUERY_ACTIVITIES, {
  type ActivitiesQuery,
  type ActivitiesQueryVariables,
} from "./graphql/queryActivities.graphql";
import { ActivityCard } from "./activity-card";

export const ActivityReplies: FC<ActivitiesProps & { activityId: string; autoFocus?: boolean }> = ({
  activityId,
  autoFocus = false,
  ...context
}) => {
  const { data } = useQuery<ActivitiesQuery, ActivitiesQueryVariables>(QUERY_ACTIVITIES, {
    variables: {
      contextId: context.contextId,
      contextType: context.contextType,
      parentId: activityId,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  return (
    <Stack pl="lg" gap={0}>
      <Stack gap={0}>
        {data?.activities.data.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </Stack>

      <Group p="sm">
        <ActivitiesInput {...context} parentId={activityId} autoFocus={autoFocus} />
      </Group>
    </Stack>
  );
};
