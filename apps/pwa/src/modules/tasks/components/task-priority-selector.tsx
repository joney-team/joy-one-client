"use client";

import { t } from "@/modules/lang/lang-service";
import { getTaskPriorityColor } from "@/modules/tasks/tasks-service";
import { TaskPriority } from "@/modules/tasks/tasks-types";
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
import { useColor } from "@/modules/theme/use-color";

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

  return (
    <Selector
      {...props.inputProps}
      pinnedOptions={Object.values(TaskPriority).map((priority) => ({ id: priority }))}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(priority) => {
        const priorityColor = getTaskPriorityColor(priority.id);
        return (
          <Combobox.Option value={priority.id} key={priority.id}>
            <Group gap={8} wrap="nowrap">
              <ThemeIcon color={color(priorityColor)} variant="transparent">
                <IconFlagFilled size={20} />
              </ThemeIcon>
              <Stack gap={3}>
                <Text>{t(`task_priority_${priority.id}`)}</Text>
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
