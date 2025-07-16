import { FC } from "react";
import { getTaskEntity } from "./tasks-service";
import { Card, Group, Text } from "@mantine/core";

export const TaskCardOverlay: FC<{ id: string }> = (props) => {
  const task = getTaskEntity(props.id);
  if (!task) return null;

  return (
    <Card p={10} w="100%" h="100%">
      <Group w="100%" h="100%">
        <Text fz={14} fw={500} maw={250} truncate>
          {task.name}
        </Text>
      </Group>
    </Card>
  );
};
