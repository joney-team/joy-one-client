"use client";

import { SortDirection } from "@/graphql/enums.graphql";
import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import { FC } from "react";
import { ActivitiesInput } from "./activities-input";
import { ActivitiesProps } from "./activities-types";
import { ActivityCard } from "./activity-card";
import QUERY_ACTIVITIES, {
  type ActivitiesQuery,
  type ActivitiesQueryVariables,
} from "./graphql/queryActivities.graphql";

export const Activities: FC<ActivitiesProps> = (props) => {
  const { data } = useQuery<ActivitiesQuery, ActivitiesQueryVariables>(QUERY_ACTIVITIES, {
    variables: {
      contextType: props.contextType,
      contextId: props.contextId,
      sortCreatedAt: SortDirection.Asc,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  return (
    <Stack gap="sm">
      {data?.activities.data.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}

      <ActivitiesInput {...props} />
    </Stack>
  );
};
