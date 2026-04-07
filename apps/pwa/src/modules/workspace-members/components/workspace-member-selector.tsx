"use client";

import { Avatar } from "@/components/avatar";
import { searchEntity } from "@/modules/search/search-service";
import { WorkspaceMemberRoleName } from "@/modules/workspace-roles/components/workspace-role-name";
import { AppEntity } from "@/types";
import { ActionIcon, Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorProps } from "../../../components/selector";
import { WorkspaceMemberFragment } from "../graphql/fragmentWorkspaceMember.graphql";
import GetWorkspaceMembersDocument from "../graphql/getWorkspaceMembers.graphql";
import GetWorkspaceMembersByIdsDocument from "../graphql/getWorkspaceMembersByIds.graphql";
import { useApolloClient } from "@apollo/client/react";

export type WorkspaceMemberSelectorValue = WorkspaceMemberFragment;

export interface WorkspaceMemberSelectorProps extends Omit<
  SelectorProps<WorkspaceMemberSelectorValue>,
  "listQuery" | "searchPlaceholder" | "renderOption"
> {
  iconSize?: number;
  avatarSize?: number;
  collapsed?: boolean;
  optionRightSection?: (user: WorkspaceMemberSelectorValue) => ReactNode;
}

export const WorkspaceMemberSelector: FC<WorkspaceMemberSelectorProps> = (props) => {
  const client = useApolloClient();
  const { iconSize, avatarSize, collapsed, optionRightSection, ...rest } = props;

  return (
    <Selector<WorkspaceMemberSelectorValue>
      {...rest}
      autoCloseOnChange={false}
      listQuery={GetWorkspaceMembersDocument}
      renderOption={(user) => {
        return (
          <Combobox.Option value={user._id} key={user._id}>
            <Group gap={8} justify="space-between">
              <Group gap={8}>
                <Avatar user={user} size={avatarSize || 28} />
                <Stack gap={3}>
                  <Text>{user.name}</Text>

                  <Text fz={em(10)} mt={-2}>
                    <WorkspaceMemberRoleName member={user} />
                  </Text>
                </Stack>
              </Group>

              {props.optionRightSection && props.optionRightSection(user)}
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        if (rest.target) return rest.target(ctx);

        return (
          <ActionIcon
            color="gray.4"
            size={props.iconSize || em(34)}
            variant="outline"
            radius={150}
            onClick={ctx.toggle}
          >
            <IconUserPlus size={18} />
          </ActionIcon>
        );
      }}
      onSearch={async (q) => {
        const result = await searchEntity(AppEntity.WORKSPACE_MEMBERS, q).then((res) =>
          res.filter((v) => v.__typename === "SearchResultWorkspaceMember"),
        );

        const members = await client.query({
          query: GetWorkspaceMembersByIdsDocument,
          variables: {
            ids: result.map((v) => v.userId),
          },
        });

        return members.data?.members ?? [];
      }}
    />
  );
};
