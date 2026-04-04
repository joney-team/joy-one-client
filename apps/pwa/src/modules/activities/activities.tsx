"use client";

import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC } from "react";
import { ActivitiesProps } from "./activities-types";
import { ActivityCard } from "./activity-card";
import { ActivityInput } from "./activity-input";
import GetActivitiesDocument from "./graphql/getActivities.graphql";

const ActivitiesEvents = dynamic(
  () => import("./activities-events").then((mod) => mod.ActivitiesEvents),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const Activities: FC<ActivitiesProps> = (props) => {
  const { data } = useQuery(GetActivitiesDocument, {
    variables: {
      contextType: props.contextType,
      contextId: props.contextId,
    },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Stack gap="sm">
      {data?.list.results.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}

      <ActivityInput {...props} />
      <ActivitiesEvents />
    </Stack>
  );
};
