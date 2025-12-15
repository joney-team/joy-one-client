"use client";

import { FocusTrap, Stack } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { EstimateTimeInput } from "@/components/inputs/estimate-time-input/estimate-time-input";
import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

export const TaskMenuEstimateTime: TaskMenuComponent = ({
  task,
  onClose,
  groupVariables,
  updateTask,
}) => {
  const { t } = useLingui();
  const [estimatedTime, setEstimatedTime] = useState<number | null>(task.estimatedTime ?? null);

  return (
    <FocusTrap>
      <Stack p="sm">
        <EstimateTimeInput
          description={t`Enter number of days, hours, minutes`}
          placeholder="e.g. 2d 4h 30m"
          value={estimatedTime}
          onSubmit={(value) => {
            console.log("value", value);

            updateTask({
              _id: task._id,
              estimatedTime: value,
              context: { fromGroupVariables: groupVariables },
            });

            setEstimatedTime(value);
            onClose();
          }}
        />
      </Stack>
    </FocusTrap>
  );
};
