"use client";

import { useQuery } from "@apollo/client/react";
import { Group, Stack } from "@mantine/core";
import { type FC } from "react";
import { ActivitiesProps } from "./activities-types";
import { ActivityCard } from "./activity-card";
import { ActivityInput } from "./activity-input";
import QUERY_ACTIVITIES, {
  type ActivitiesQuery,
  type ActivitiesQueryVariables,
} from "./graphql/queryActivities.graphql";

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
  });

  return (
    <Stack pl="lg" gap={0}>
      <Stack gap={0}>
        {data?.activities.results.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </Stack>

      <Group p="sm">
        <ActivityInput {...context} parentId={activityId} autoFocus={autoFocus} />
      </Group>
    </Stack>
  );
};
