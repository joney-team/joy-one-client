import { TextInput } from "@/components/inputs/text-input";
import { t } from "@/modules/lang/lang-service";
import { updateTasks } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { ActionIcon, Group, InputWrapper, InputWrapperProps, Popover, Text } from "@mantine/core";
import { IconHourglassHigh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, PropsWithChildren, useState } from "react";

interface EstimateTimeInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
}

export function parseTimeInput(input: string) {
  const regex = /(\d+)([dhm])/g;
  let totalSeconds = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        totalSeconds += dayjs.duration(value, "days").asSeconds();
        break;
      case "h":
        totalSeconds += dayjs.duration(value, "hours").asSeconds();
        break;
      case "m":
        totalSeconds += dayjs.duration(value, "minutes").asSeconds();
        break;
    }
  }

  return totalSeconds;
}

export function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);

  let result = [];
  if (days > 0) result.push(`${days}d`);
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);

  return result.length > 0 ? result.join(" ") : "0m";
}

export const EstimateTimeInput: FC<EstimateTimeInputProps> = (props) => {
  const { value, onChange, label, ...rest } = props;
  const placeholder = rest.placeholder || t("select");
  const [opened, setOpened] = useState(false);

  return (
    <InputWrapper {...rest}>
      <Popover opened={opened} onChange={setOpened} shadow="md">
        <Popover.Target>
          <Group h={34} flex={rest.flex} onClick={() => setOpened(true)} className="clickable">
            {props.value ? (
              <Text>{formatDuration(props.value)}</Text>
            ) : (
              <Text c="gray" fz={13} px={3}>
                {placeholder}
              </Text>
            )}
          </Group>
        </Popover.Target>

        <Popover.Dropdown p={10}>
          <Group>
            <TextInput
              miw={300}
              autoFocus
              label={label ? t(label as string) : undefined}
              placeholder={t("estimate_time_input_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  onChange?.(parseTimeInput(value));
                  setOpened(false);
                }
              }}
            />
          </Group>
        </Popover.Dropdown>
      </Popover>
    </InputWrapper>
  );
};

export interface QuickEstimateTimeInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  task: TaskEntity;
}

export const QuickEstimateTimeInput: FC<PropsWithChildren<QuickEstimateTimeInputProps>> = (props) => {
  const [opened, setOpened] = useState(false);

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconHourglassHigh size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  const label = t("tasks_view_estimate_time");

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={label}
          placeholder={t("estimate_time_input_placeholder")}
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
