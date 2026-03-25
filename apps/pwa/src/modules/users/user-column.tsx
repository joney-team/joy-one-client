"use client";

import { Avatar } from "@/components/avatar";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { Group, Stack, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { searchEntity } from "../search/search-service";
import { WorkspaceMemberFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import QUERY_WORKSPACE_MEMBERS_BY_IDS from "../workspace-members/graphql/queryWorkspaceMembersByIds.graphql";
import { WorkspaceMemberRoleName } from "../workspace-roles/components/workspace-role-name";
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
      const user = value as WorkspaceMemberFragment;

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
                  <WorkspaceMemberRoleName member={user} />
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
        getOptionId: (item) => item.userId,
        getSelectedOptions: async (ids: string[], client) => {
          return client
            .query({
              query: QUERY_WORKSPACE_MEMBERS_BY_IDS,
              variables: {
                ids,
              },
              fetchPolicy: "network-only",
            })
            .then((res) => {
              return (res.data?.workspaceMembersByIds ?? []).map((v) => ({
                label: v.name,
                value: v.userId,
                data: v,
              }));
            });
        },
        search: async (query) => {
          return searchEntity(AppEntity.WORKSPACE_MEMBERS, query).then((res) =>
            res.map((v) => ({
              label: v.name,
              value: v.userId,
              data: v,
            })),
          );
        },
        render: ({ data: member }) => {
          return (
            <Group gap={8} className="clickable">
              <Avatar user={member} size="sm" />
              <Stack gap={0}>
                <Text fz={14} fw={500}>
                  {member.name}
                </Text>
                <Text fz={10} c="gray">
                  <WorkspaceMemberRoleName member={member} />
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
