import { Card, Group, Text } from "@mantine/core";
import { type FC } from "react";
import { useListTaskView } from "../list-task-view-context";

interface ListTaskRowOverlayProps {
  id?: string | null;
}

export const ListTaskRowOverlay: FC<ListTaskRowOverlayProps> = (props) => {
  const { tasks } = useListTaskView();
  const task = tasks.find((v) => v._id === props.id);

  if (!task) return;

  return (
    <Card w="100%" h="100%" p={0}>
      <Group h="100%" align="center" px={16}>
        <Text maw={200} truncate fz={14} fw={500}>
          {task.name}
        </Text>
      </Group>
    </Card>
  );
};
