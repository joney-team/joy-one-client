"use client";

import { searchArray } from "@/modules/search/search-service";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity, TaskStatus } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { ActionIcon, em, Group, Menu, TextInput } from "@mantine/core";
import { IconCheck, IconSettings } from "@tabler/icons-react";
import { FC, MouseEventHandler, useState } from "react";

interface TaskStatusOptionsProps {
  task: TaskEntity;
  size?: number;
  disabled?: boolean;
  target?: React.ReactNode;
  onSelect?: (status: string) => void;
}

export const TaskStatusOptions: FC<TaskStatusOptionsProps> = (props) => {
  const workspace = useWorkspace();
  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.task.status) ||
    workspace.settings.taskStatuses[0];
  const activatedStyle = renderTaskStatusStyle(props.task.status, workspace.settings.taskStatuses);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Menu position="bottom-start" disabled={props.disabled} opened={opened} onChange={setOpened}>
      <Menu.Target>
        {props.target || (
          <ActionIcon variant="subtle" color={activatedStyle.color}>
            <TaskStatusIcon {...status} />
          </ActionIcon>
        )}
      </Menu.Target>

      <Menu.Dropdown>
        <Group>
          <TextInput
            styles={{
              input: {
                border: "none",
              },
            }}
            placeholder={t`Search`}
            rightSection={
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  OnTaskSatusesModal();
                  setOpened(false);
                }}
              >
                <IconSettings size={18} />
              </ActionIcon>
            }
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </Group>

        <Menu.Divider />

        {(search.length > 0
          ? searchArray(workspace.settings.taskStatuses, ["name"], search)
          : workspace.settings.taskStatuses
        ).map((status) => {
          const iconStyle = renderTaskStatusStyle(status.id, workspace.settings.taskStatuses);

          return (
            <Menu.Item
              key={status.id}
              tt="uppercase"
              fz={em(13)}
              leftSection={<TaskStatusIcon size={16} {...status} />}
              onClick={() => {
                props.onSelect?.(status.id);
              }}
            >
              {iconStyle.name}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

export const TaskStatusIcon: FC<
  TaskStatus & {
    size?: number;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    mr?: number;
    white?: boolean;
    opacity?: number;
  }
> = (props) => {
  const size = props.size || 18;
  const color = useColor();
  const _color = color(props.color || "gray");
  const closed = props.id === DefaultTaskStatusId.CLOSED;

  return (
    <Group
      className="TaskStatusIcon"
      w={size}
      h={size}
      mr={props.mr}
      style={{
        borderWidth: 1.5,
        borderStyle: "solid",
        borderRadius: "50%",
        cursor: "pointer",
        borderColor: props.white ? "white" : _color,
      }}
      opacity={props.opacity}
      bg={props.white || closed ? _color : "transparent"}
      p={closed ? 0 : 1.5}
      align="center"
      justify="center"
      onClick={props.onClick}
    >
      {closed ? (
        <IconCheck
          color={props.white || closed ? "white" : _color}
          size={size * 0.7}
          strokeWidth={3}
        />
      ) : (
        <Group
          bg={props.white ? "white" : _color}
          w="100%"
          h="100%"
          style={{ borderRadius: "50%" }}
        />
      )}
    </Group>
  );
};
