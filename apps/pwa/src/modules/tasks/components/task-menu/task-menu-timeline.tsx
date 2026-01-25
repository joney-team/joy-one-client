"use client";

import { DueDateInput } from "@/components/inputs/due-date-input";
import { Card } from "@mantine/core";
import { useState } from "react";
import { TaskMenuComponent } from "./task-menu-types";

export const TaskMenuTimeline: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const [timeline, setTimeline] = useState(task);

  return (
    <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
      <DueDateInput
        p={10}
        pt={6}
        startDate={timeline.startDate}
        dueDate={timeline.dueDate}
        onChange={async (e) => {
          setTimeline((state) => ({ ...state, ...e }));
          await updateTask({
            _id: task._id,
            ...e,
            context: { fromGroupVariables: groupVariables },
          });
        }}
      />
    </Card>
  );
};
