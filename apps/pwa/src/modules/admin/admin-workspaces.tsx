"use client";

import { List } from "@/components/list";
import { Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { WorkspaceStatsEntity } from "../workspace-stats/workspace-stats.types";
import { t } from "../lang/lang-service";
import { Avatar } from "@/components/avatar";
import { WorkspaceType } from "../workspaces/workspaces-types";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { formatBytes } from "@joy-one-client/utils/files";

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
          type: EnumColumn<WorkspaceType>({
            w: 200,
            valuePath: "workspace.type",
            name: "Type",
            options: Object.values(WorkspaceType).map((type) => ({
              label: t(`ws_${type}`),
              value: type,
            })),
          }),
          memberCount: {
            name: "Members",
            w: 150,
            sortable: true,
          },
          customerCount: {
            name: "Customers",
            w: 150,
            sortable: true,
          },
          bookingCount: {
            name: "Bookings",
            w: 150,
            sortable: true,
          },
          orderCount: {
            name: "Orders",
            w: 150,
            sortable: true,
          },
          storageUsage: {
            name: "Storage Usage",
            w: 150,
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
