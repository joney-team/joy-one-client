"use client";

import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import { FC } from "react";
import { ActivityInput } from "./activity-input";
import { ActivitiesProps } from "./activities-types";
import { ActivityCard } from "./activity-card";
import QUERY_ACTIVITIES, {
  type ActivitiesQuery,
  type ActivitiesQueryVariables,
} from "./graphql/queryActivities.graphql";
import dynamic from "next/dynamic";
import { nonLoading } from "@/utils/non-loading";

const ActivitiesEvents = dynamic(
  () => import("./activities-events").then((mod) => mod.ActivitiesEvents),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const Activities: FC<ActivitiesProps> = (props) => {
  const { data } = useQuery<ActivitiesQuery, ActivitiesQueryVariables>(QUERY_ACTIVITIES, {
    variables: {
      contextType: props.contextType,
      contextId: props.contextId,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  return (
    <Stack gap="sm">
      {data?.activities.results.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}

      <ActivityInput {...props} />
      <ActivitiesEvents />
    </Stack>
  );
};
