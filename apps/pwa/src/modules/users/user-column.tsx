"use client";

import { Avatar } from "@/components/avatar";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { Group, Stack, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { searchEntity } from "../search/search-service";
import {
  getWorkspaceMemberRoleLabel,
  getWorkspaceMemberByIds,
} from "../workspace-members/workspace-members-service";
import { WorkspaceMemberInfo } from "../workspace-members/workspace-members-types";
import { OnModalUserInformation } from "./modals/modal-user-information";

export interface UserColumnArgs extends Omit<Column, "render"> {
  optionalValuePath?: string;
}

export const UserColumn = (args?: UserColumnArgs): Column => {
  return {
    icon: IconUser,
    render: ({ value }) => {
      if (!value) return null;
      const user = value as WorkspaceMemberInfo;

      return (
        <Group gap={8} className="clickable" onClick={() => OnModalUserInformation(user.userId)}>
          <Avatar user={user} size="sm" />
          <Stack gap={0}>
            <Text fz={16} fw={500}>
              {user.name}
            </Text>
            <Text fz={10} c="gray">
              {getWorkspaceMemberRoleLabel(user)}
            </Text>
          </Stack>
        </Group>
      );
    },
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        listRoute: "/workspace-members",
        getOptions: async (ids: string[]) => {
          return getWorkspaceMemberByIds(ids).then((res) =>
            res.map((v) => ({
              label: v.name,
              value: v.userId,
              data: v,
            }))
          );
        },
        search: async (query) => {
          return searchEntity(AppEntity.WORKSPACE_MEMBERS, query).then((res) =>
            res.map((v) => ({
              label: v.name,
              value: v.userId,
              data: v,
            }))
          );
        },
        render: ({ data: user }) => {
          return (
            <Group gap={8} className="clickable">
              <Avatar user={user} size="sm" />
              <Stack gap={0}>
                <Text fz={14} fw={500}>
                  {user.name}
                </Text>
                <Text fz={10} c="gray">
                  {getWorkspaceMemberRoleLabel(user)}
                </Text>
              </Stack>
            </Group>
          );
        },
      },
    },
    exportToExcel: false,
    ...args,
  };
};
