"use client";

import { updateTasks } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Group,
  InputWrapperProps,
  Popover,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { IconHourglassHigh } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";
import { parseTimeInput } from "./estimate-time-input-utils";

interface EstimateTimeInputProps extends Omit<TextInputProps, "value" | "onChange" | "onSubmit"> {
  value?: number | null;
  onSubmit: (value: number) => void;
}

export const EstimateTimeInput: FC<EstimateTimeInputProps> = (props) => {
  const { value, onSubmit, ...rest } = props;

  return (
    <TextInput
      miw={300}
      {...rest}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const value = (e.target as HTMLInputElement).value;
          onSubmit(parseTimeInput(value));
        }
      }}
    />
  );
};

export interface QuickEstimateTimeInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  task: TaskEntity;
}

export const QuickEstimateTimeInput: FC<PropsWithChildren<QuickEstimateTimeInputProps>> = (
  props
) => {
  const [opened, setOpened] = useState(false);
  const { t } = useLingui();

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconHourglassHigh size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={<Trans>Estimate time</Trans>}
          placeholder={t`Enter number of days, hours, minutes (e.g. 2d 4h 30m)`}
          autoFocus
          miw={260}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const duration = parseTimeInput((e.target as HTMLInputElement).value);
              updateTasks([
                {
                  ...props.task,
                  estimatedTime: duration,
                },
              ]);
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
