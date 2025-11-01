"use client";

import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { formatBytes } from "@joy-one-client/utils/files";
import { Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { WorkspaceStatsEntity } from "../workspace-stats/workspace-stats.types";
import { workspaceTypes } from "../workspaces/workspace-constants";
import { WorkspaceType } from "../workspaces/workspaces-types";

export const AdminWorkspaces: FC = () => {
  return (
    <Stack p={16}>
      <List<WorkspaceStatsEntity & { type: WorkspaceType }>
        id="wss"
        route="/workspace-stats/admin"
        columns={{
          workspace: {
            name: "Information",
            render: ({ data }) => {
              return (
                <Group>
                  <Avatar workspace={data.workspace} />
                  <Text>{data.workspace.name}</Text>
                </Group>
              );
            },
          },
          type: enumColumn<WorkspaceType>({
            defaultWidth: 200,
            valuePath: "workspace.type",
            name: "Type",
            options: Object.values(WorkspaceType).map((type) => ({
              label: workspaceTypes[type].name(),
              value: type,
            })),
          }),
          memberCount: {
            name: "Members",
            defaultWidth: 150,
            sortable: true,
          },
          customerCount: {
            name: "Customers",
            defaultWidth: 150,
            sortable: true,
          },
          bookingCount: {
            name: "Bookings",
            defaultWidth: 150,
            sortable: true,
          },
          orderCount: {
            name: "Orders",
            defaultWidth: 150,
            sortable: true,
          },
          storageUsage: {
            name: "Storage Usage",
            defaultWidth: 150,
            sortable: true,
            render: ({ value }) => {
              return formatBytes(value ?? 0);
            },
          },
        }}
      />
    </Stack>
  );
};
