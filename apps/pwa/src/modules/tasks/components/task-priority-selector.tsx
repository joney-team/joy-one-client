"use client";

import { TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Combobox,
  em,
  Group,
  InputWrapperProps,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconFlagFilled } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";
import { taskPriorities } from "../tasks-constants";

interface TaskPrioritySelectorProps {
  render?: (ctx: SelectorContext<{ id: TaskPriority }>) => ReactNode;
  onSelect: (value: TaskPriority) => void;
  iconSize?: number;
  collapsed?: boolean;
  disabled?: boolean;
  inputProps?: InputWrapperProps;
}

export const TaskPrioritySelector: FC<TaskPrioritySelectorProps> = (props) => {
  const color = useColor();
  const { t } = useLingui();

  return (
    <Selector
      {...props.inputProps}
      pinnedOptions={Object.values(TaskPriority).map((priority) => ({ id: priority }))}
      renderOption={(priority) => {
        const taskPriority = taskPriorities[priority.id];
        if (!taskPriority) return null;

        return (
          <Combobox.Option value={priority.id} key={priority.id}>
            <Group gap={8} wrap="nowrap">
              <ThemeIcon color={color(taskPriority.color)} variant="transparent">
                <IconFlagFilled size={20} />
              </ThemeIcon>
              <Stack gap={3}>
                <Text>{t(taskPriority.label)}</Text>
              </Stack>
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        if (props.render) return props.render(ctx);

        return (
          <ActionIcon
            color="gray.4"
            size={props.iconSize || em(34)}
            variant="outline"
            radius={150}
            onClick={ctx.toggle}
          >
            <IconFlagFilled size={18} />
          </ActionIcon>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e.id);
      }}
      staticSearch
      dropdownProps={{
        miw: 200,
      }}
    />
  );
};
