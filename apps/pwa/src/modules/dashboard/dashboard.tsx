"use client";

import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DashboardWidgets } from "@/widgets/dashboard";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { DashboardBookings } from "./dashboard-bookings";

export const AppDashboard: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <DashboardWidgets />
      {workspace.hasPermission(WorkspacePermission.BOOKING_VIEW) && <DashboardBookings />}
    </Stack>
  );
};
