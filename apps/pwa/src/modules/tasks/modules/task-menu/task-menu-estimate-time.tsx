"use client";

import { FocusTrap, Group, Stack } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { EstimateTimeInput } from "@/components/inputs/estimate-time-input/estimate-time-input";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { Button } from "@/components/buttons/button";

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
      <Stack p="sm" gap="xs">
        <EstimateTimeInput
          description={t`Enter number of days, hours, minutes`}
          placeholder="e.g. 2d 4h 30m"
          value={estimatedTime}
          onSubmit={(value) => {
            updateTask({
              _id: task._id,
              estimatedTime: value,
              context: { fromGroupVariables: groupVariables },
            });

            setEstimatedTime(value);
            onClose();
          }}
        />

        <Group>
          <Button
            size="compact-xs"
            color="gray"
            variant="light"
            onClick={() => {
              updateTask({
                _id: task._id,
                estimatedTime: null,
                context: { fromGroupVariables: groupVariables },
              });
              setEstimatedTime(null);
              onClose();
            }}
          >
            <Trans>Clear estimated time</Trans>
          </Button>
        </Group>
      </Stack>
    </FocusTrap>
  );
};
