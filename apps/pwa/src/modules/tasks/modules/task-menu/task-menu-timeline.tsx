"use client";

import { Card } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { useState } from "react";

export const TaskMenuTimeline: TaskMenuComponent = ({ task, groupVariables }) => {
  const { updateTasks } = useUpdateTasks();
  const [timeline, setTimeline] = useState(task);

  return (
    <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
      <DueDateInput
        p={10}
        startDate={timeline.startDate}
        dueDate={timeline.dueDate}
        onChange={async (e) => {
          setTimeline((state) => ({ ...state, ...e }));
          await updateTasks([
            { _id: task._id, ...e, context: { fromGroupVariables: groupVariables } },
          ]);
        }}
      />
    </Card>
  );
};
