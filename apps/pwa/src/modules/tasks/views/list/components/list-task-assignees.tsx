import { Avatar } from "@/components/avatar";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { ActionIcon, Group, HoverCard, Stack, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { type FC } from "react";

export interface ListTaskAssigneesProps {
  task: Pick<TaskEntity, "_id" | "assigneeUsers">;
  readOnly?: boolean;
}

const AssigneeCard: FC<{ assignee: NonNullable<TaskEntity["assigneeUsers"]>[number] }> = ({
  assignee,
}) => {
  return (
    <Stack>
      <Group>
        <Avatar user={assignee} />
        <Stack>
          <Text>{assignee.name}</Text>
        </Stack>
      </Group>
    </Stack>
  );
};

export const ListTaskAssignees: FC<ListTaskAssigneesProps> = ({ task, readOnly }) => {
  const assigneeUsers = task.assigneeUsers ?? [];

  const Target = () => {
    if (assigneeUsers.length > 0) {
      return (
        <Group gap={0}>
          {assigneeUsers.map((assignee) => {
            return (
              <HoverCard key={assignee._id}>
                <HoverCard.Target>
                  <Avatar user={assignee} size={28} />
                </HoverCard.Target>

                <HoverCard.Dropdown>
                  <AssigneeCard assignee={assignee} />
                </HoverCard.Dropdown>
              </HoverCard>
            );
          })}
        </Group>
      );
    }

    return (
      <ActionIcon component="div" color="gray.4" size={28} variant="outline" radius={150}>
        <IconUserPlus size={18} />
      </ActionIcon>
    );
  };

  if (readOnly) return <Target />;

  return (
    <WorkspaceMemberSelector
      comboboxProps={{
        position: "bottom-end",
      }}
      target={(ctx) => {
        return (
          <Group onClick={ctx.toggle}>
            <Target />
          </Group>
        );
      }}
    />
  );
};
