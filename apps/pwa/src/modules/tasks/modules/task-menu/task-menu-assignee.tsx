"use client";

import { useQuery } from "@apollo/client/react";
import { Card, Group, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
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
import { useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import styles from "./task-menu.module.css";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { useUserWorkspaceMember } from "@/modules/workspace-members/workspace-members-hooks";

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
  const [selected, setSelected] = useState<TaskDataFragment["assigneeUsers"]>(task.assigneeUsers);

  const { userWorkspaceMember } = useUserWorkspaceMember();

  const { data } = useQuery<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>(
    QUERY_WORKSPACE_MEMBERS,
    {
      variables: {
        ignoreSelf: true,
      },
    }
  );

  const { updateTasks } = useUpdateTasks();

  return (
    <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
      <Group p={8} pb={0}>
        <TextInput leftSection={<IconSearch size={16} />} placeholder={t`Search`} />
      </Group>
      <ScrollArea.Autosize mah={300} offsetScrollbars scrollbarSize={6}>
        <Stack py={5} px={5} gap={0}>
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

          {data?.workspaceMembers.data.map((member) => {
            const isSelected = selected.some((u) => u._id === member._id);

            return (
              <MenuAssignee
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
