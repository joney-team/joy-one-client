"use client";

import { useLazyQuery, useQuery } from "@apollo/client/react";
import { Card, Group, Loader, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { Avatar } from "@/components/avatar";
import { useColor } from "@/modules/theme/use-color";
import QUERY_WORKSPACE_MEMBERS, {
  type WorkspaceMembersQuery,
  type WorkspaceMembersQueryVariables,
} from "@/modules/workspace-members/graphql/queryWorkspaceMembers.graphql";
import { getWorkspaceMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { t } from "@lingui/core/macro";
import { IconSearch } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import styles from "./task-menu.module.css";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { useUserWorkspaceMember } from "@/modules/workspace-members/workspace-members-hooks";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { useDebouncedCallback, useDebouncedState, useThrottledCallback } from "@mantine/hooks";

const MenuAssignee = ({
  member,
  isSelected,
  onClick,
  isSelf,
}: {
  member: WorkspaceMembersQuery["workspaceMembers"]["data"][number];
  isSelected: boolean;
  onClick: () => void;
  isSelf?: boolean;
}) => {
  const color = useColor();

  return (
    <Group
      className={styles.TaskMenuItem}
      gap={8}
      pr={12}
      pl={6}
      py={5}
      align="center"
      onClick={onClick}
    >
      <Group gap={8}>
        <Group
          style={{
            border: `1px solid transparent`,
            borderColor: isSelected ? color(member.color || "gray") : "transparent",
            borderRadius: "50%",
            padding: 2,
          }}
        >
          <Avatar user={member} size={28} />
        </Group>
        <Stack gap={0}>
          <Text fz={13} fw={500}>
            {member.name}{" "}
            {isSelf && (
              <Text component="span" c="gray" fz={11}>
                (<Trans>You</Trans>)
              </Text>
            )}
          </Text>

          <Text fz={10} c="gray">
            {getWorkspaceMemberRoleLabel(member)}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
};

export const TaskMenuAssignee: TaskMenuComponent = ({ task, groupVariables }) => {
  const { userWorkspaceMember } = useUserWorkspaceMember();

  const [selected, setSelected] = useState<TaskDataFragment["assigneeUsers"]>(task.assigneeUsers);
  const [textSearch, setTextSearch] = useDebouncedState("", 300);

  const [getMembers, { data, loading }] = useLazyQuery<
    WorkspaceMembersQuery,
    WorkspaceMembersQueryVariables
  >(QUERY_WORKSPACE_MEMBERS, { fetchPolicy: "network-only" });

  const onGetMembers = useCallback(
    async (q: string) => {
      if (q.length > 0) {
        const searchResult = await searchEntity(AppEntity.WORKSPACE_MEMBERS, q);
        if (searchResult.length === 0) return;

        await getMembers({
          variables: { ignoreSelf: true, ids: searchResult.map((result) => result._id) },
        });
        return;
      }

      await getMembers({ variables: { ignoreSelf: true } });
    },
    [getMembers]
  );

  useEffect(() => {
    onGetMembers(textSearch);
  }, [textSearch, getMembers]);

  const { updateTasks } = useUpdateTasks();

  return (
    <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
      <Group p={8} pb={0}>
        <TextInput
          radius={8}
          leftSection={<IconSearch size={16} />}
          placeholder={t`Search`}
          onChange={(e) => setTextSearch(e.target.value)}
          rightSection={loading ? <Loader size="xs" type="dots" color="gray" /> : undefined}
          styles={{
            input: {
              backgroundColor: "var(--mantine-color-default-hover)",
              border: "none",
            },
          }}
        />
      </Group>
      <ScrollArea.Autosize mah={220} offsetScrollbars scrollbarSize={6}>
        <Stack py={5} px={5} gap={0}>
          {textSearch.length === 0 && (
            <Fragment>
              {userWorkspaceMember && (
                <MenuAssignee
                  isSelf
                  member={userWorkspaceMember}
                  isSelected={selected.some((u) => u._id === userWorkspaceMember._id)}
                  onClick={() => {
                    const isSelected = selected.some((u) => u._id === userWorkspaceMember._id);
                    const data = isSelected
                      ? selected.filter((t) => t._id !== userWorkspaceMember._id)
                      : [...selected, userWorkspaceMember];

                    setSelected(data);
                    updateTasks({
                      _id: task._id,
                      assigneeUsers: data,
                      context: { fromGroupVariables: groupVariables },
                    });
                  }}
                />
              )}

              {selected.map((member) => {
                return (
                  <MenuAssignee
                    isSelf={member.userId === userWorkspaceMember?.userId}
                    key={member._id}
                    member={member}
                    isSelected
                    onClick={() => {
                      const data = selected.filter((t) => t._id !== member._id);
                      setSelected(data);

                      updateTasks({
                        _id: task._id,
                        assigneeUsers: data,
                        context: { fromGroupVariables: groupVariables },
                      });
                    }}
                  />
                );
              })}
            </Fragment>
          )}

          {data?.workspaceMembers.data.map((member) => {
            const isSelected = selected.some((u) => u._id === member._id);
            if (textSearch.length === 0 && isSelected) return null;

            return (
              <MenuAssignee
                isSelf={member.userId === userWorkspaceMember?.userId}
                key={member._id}
                member={member}
                isSelected={isSelected}
                onClick={() => {
                  const data = isSelected
                    ? selected.filter((t) => t._id !== member._id)
                    : [...selected, member];

                  setSelected(data);
                  updateTasks({
                    _id: task._id,
                    assigneeUsers: data,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              />
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Card>
  );
};
