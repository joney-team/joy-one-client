"use client";

import { t } from "@/modules/lang/lang-service";
import { searchArray } from "@/modules/search/search-service";
import { renderTaskStatus } from "@/modules/tasks/tasks-service";
import { TaskStatus } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, Combobox, em, Group, InputWrapperProps, Stack, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";
import { TaskStatusIcon } from "./task-status-options";

interface TaskStatusSelectorProps {
  render?: (ctx: SelectorContext<TaskStatus>) => ReactNode;
  onSelect: (value: TaskStatus) => void;
  iconSize?: number;
  collapsed?: boolean;
  disabled?: boolean;
  inputProps?: InputWrapperProps;
}

export const TaskStatusSelector: FC<TaskStatusSelectorProps> = (props) => {
  const workspace = useWorkspace();

  const taskStatuses = workspace.settings.taskStatuses.map((status) => ({
    ...status,
    name: renderTaskStatus(status.id, workspace.settings.taskStatuses).name,
  })) as TaskStatus[];

  return (
    <Selector
      {...props.inputProps}
      pinnedOptions={taskStatuses}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(status) => {
        return (
          <Combobox.Option value={status.id} key={status.id}>
            <Group gap={8} wrap="nowrap">
              <TaskStatusIcon {...status} />
              <Stack gap={3}>
                <Text>{status.name}</Text>
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
            <IconUserPlus size={18} />
          </ActionIcon>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e);
      }}
      onSearch={(q) => searchArray(taskStatuses, ["name"], q)}
      staticSearch
      dropdownProps={{
        miw: 200,
      }}
    />
  );
};
