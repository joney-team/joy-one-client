"use client";

import { nonLoading } from "@/utils/non-loading";
import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { type FC } from "react";

const DashboardSuggestions = dynamic(
  () => import("./dashboard-suggestions").then((mod) => mod.DashboardSuggestions),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const DashboardWidgets = dynamic(
  () => import("@/widgets/dashboard").then((mod) => mod.DashboardWidgets),
  {
    ssr: false,
    loading: () => <Skeleton height={300} />,
  }
);

const DashboardBookings = dynamic(
  () => import("./dashboard-bookings").then((mod) => mod.DashboardBookings),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const AppDashboard: FC = () => {
  return (
    <Stack p="md">
      <DashboardSuggestions />
      <DashboardWidgets />
      <DashboardBookings />
    </Stack>
  );
};
