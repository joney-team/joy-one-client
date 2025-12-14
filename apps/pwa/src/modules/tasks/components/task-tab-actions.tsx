"use client";

import { Button } from "@/components/buttons/button";
import { type ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu } from "@mantine/core";
import {
  IconEdit,
  IconFilter,
  IconFilterFilled,
  IconFlag,
  IconRefresh,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, type FC } from "react";
import { useFolderStatuses } from "../hooks/use-task-statuses";
import { useTaskMenu } from "../modules/task-menu/task-menu";
import { TaskMenuAction } from "../modules/task-menu/task-menu-types";
import { useTasks } from "../tasks-context";
import { useDisclosure } from "@mantine/hooks";

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const TaskTabActions: FC = () => {
  const { activatedFolder, setState, state } = useTasks();
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const statuses = useFolderStatuses(activatedFolder?._id);

  const filterKeys = useMemo(() => {
    return Object.keys(state.variables ?? {}).filter((v) => {
      if (!state.variables) return false;
      return (
        state.variables[v as keyof typeof state.variables] !== undefined &&
        state.variables[v as keyof typeof state.variables] !== null
      );
    });
  }, [state.variables]);

  const menuTask = useTaskMenu({
    task: {
      _id: "filter-tasks",
      statuses: [...statuses.inprogress, ...statuses.closed],
    },
    options: {
      position: "left",
      offset: {
        x: 10,
        y: -4,
      },
    },
    groupVariables: null,
    updateTask: async (e) => {
      if ("priority" in e) {
        setState((s) => ({ ...s, variables: { ...s.variables, priority: e.priority } }));
      }

      if ("assigneeUsers" in e) {
        setState((s) => ({
          ...s,
          variables: {
            ...s.variables,
            assigneeUserIds: e.assigneeUsers?.map((user) => user.userId),
          },
        }));
      }
    },
  });

  useEffect(() => {
    return () => {
      menuTask.close();
    };
  }, []);

  return (
    <Group justify="end" wrap="nowrap" flex={1} px="md" gap={5}>
      <Menu
        closeOnItemClick={false}
        closeOnClickOutside={!menuTask.isOpened}
        onClose={close}
        opened={opened}
      >
        <Menu.Target>
          <Button
            h={28}
            variant="outline"
            color={filterKeys.length > 0 ? "primary" : "gray"}
            px={8}
            leftIcon={filterKeys.length > 0 ? IconFilterFilled : IconFilter}
            onClick={open}
          >
            <Trans>Filter</Trans>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onMouseEnter={(e) => {
              menuTask.open({
                target: e.currentTarget,
                action: TaskMenuAction.CHANGE_PRIORITY,
                onClose: () => close(),
              });
            }}
            leftSection={<IconFlag size={16} />}
            fz={14}
          >
            <Trans>Priority</Trans>
          </Menu.Item>
          <Menu.Item
            onMouseEnter={(e) => {
              menuTask.open({ target: e.currentTarget, action: TaskMenuAction.CHANGE_ASSIGNEE });
            }}
            leftSection={<IconUsers size={16} />}
            fz={14}
          >
            <Trans>Assignees</Trans>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            onMouseEnter={() => menuTask.close()}
            onClick={() => {
              setState((s) => ({ ...s, variables: undefined }));
            }}
            leftSection={<IconRefresh size={16} />}
            fz={14}
            disabled={filterKeys.length === 0}
          >
            <Trans>Clear filter</Trans>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Button
        h={28}
        onClick={() => modalCreateTaskRef.current?.open({ initial: { folder: activatedFolder } })}
        leftIcon={IconEdit}
      >
        <Trans>Create task</Trans>
      </Button>

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Group>
  );
};
