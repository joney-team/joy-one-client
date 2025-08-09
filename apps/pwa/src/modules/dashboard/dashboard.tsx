"use client";

import { DashboardWidgets } from "@/widgets/dashboard";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { DashboardBookings } from "./dashboard-bookings";
import { DashboardSuggestions } from "./dashboard-suggestions";

export const AppDashboard: FC = () => {
  return (
    <Stack p={16}>
      <DashboardSuggestions />
      <DashboardWidgets />
      <DashboardBookings />
    </Stack>
  );
};
