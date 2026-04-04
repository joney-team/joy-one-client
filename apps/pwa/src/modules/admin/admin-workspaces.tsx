"use client";

import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { formatBytes } from "@joy-one-client/utils/files";
import { useLingui } from "@lingui/react/macro";
import { Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { workspaceTypes } from "../workspaces/workspace-constants";

import GetWorkspaceStatsDocument, {
  GetWorkspaceStatsQuery,
} from "./graphql/getWorkspaceStats.graphql";

export const AdminWorkspaces: FC = () => {
  const { t } = useLingui();

  return (
    <Stack p="md">
      <List<GetWorkspaceStatsQuery["list"]["results"][number]>
        id="wss"
        query={GetWorkspaceStatsDocument}
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
              label: t(workspaceTypes[type].name),
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
