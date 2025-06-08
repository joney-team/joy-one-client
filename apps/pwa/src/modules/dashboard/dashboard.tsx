import { type FC } from "react";
import { Stack } from "@mantine/core";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { DashboardWidgets } from "@/widgets/dashboard";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
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
