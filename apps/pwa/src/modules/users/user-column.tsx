"use client";

import { Avatar } from "@/components/avatar";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { Group, Stack, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { searchEntity } from "../search/search-service";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import {
  getMemberRoleLabel,
  getWorkspaceMemberByIds,
} from "../workspace-members/workspace-members-service";
import { ModalUserInformation } from "./modals/modal-user-information";

export interface UserColumnArgs extends Omit<Column, "render"> {
  optionalValuePath?: string;
}

export const userColumn = (args?: UserColumnArgs): Column => {
  return {
    icon: IconUser,
    defaultWidth: 200,
    render: ({ value }) => {
      if (!value) return null;
      const user = value as WorkspaceMemberDataFragment;

      return (
        <ModalUserInformation>
          {(modal) => (
            <Group
              gap={8}
              className="clickable"
              onClick={() => modal.open(user.userId)}
              wrap="nowrap"
            >
              <Avatar user={user} size="sm" />
              <Stack gap={0} flex={1}>
                <Text fz={16} fw={500} truncate>
                  {user.name}
                </Text>
                <Text fz={10} c="gray" truncate>
                  {getMemberRoleLabel(user)}
                </Text>
              </Stack>
            </Group>
          )}
        </ModalUserInformation>
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
                  {getMemberRoleLabel(user)}
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
