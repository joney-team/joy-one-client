"use client";

import { Card, Divider, Group, MantineColor, Portal, Stack, Text } from "@mantine/core";
import { Icon, IconClockHour3, IconFlagFilled, IconMaximize } from "@tabler/icons-react";
import { Fragment, ReactNode, useEffect, useRef, useState, type FC } from "react";
import { TaskMenuAction, type TaskMenu } from "./task-menu-types";

import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import styles from "./task-menu.module.css";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { TaskStatusIcon } from "../../components/task-status-options";
import { DefaultTaskStatusId } from "../../tasks-types";
import { classNames } from "@/utils/ui.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import {
  addInternalEventsListener,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { TaskPriority } from "@/graphql/enums.graphql";
import { taskPriorities } from "../../task-constants";

const MenuItem: FC<{
  icon: Icon;
  label: ReactNode;
  onClick: () => void;
  iconColor?: MantineColor;
}> = ({ icon: Icon, iconColor, label, onClick }) => {
  const color = useColor();

  return (
    <Group
      className={styles.TaskMenuItem}
      gap={6}
      pr={12}
      pl={6}
      py={6}
      align="center"
      onClick={onClick}
    >
      <Icon size={16} color={color(iconColor ?? "gray")} />
      <Text component="div" fz={13}>
        {label}
      </Text>
    </Group>
  );
};

export const TaskMenuDropdownContent: FC<TaskMenu & { onClose: () => void }> = ({
  task,
  onClose,
  groupVariables,
  action,
}) => {
  const router = useRouter();
  const color = useColor();
  const { updateTasks } = useUpdateTasks();
  const { statuses } = useTaskStatuses(task);

  if (action === TaskMenuAction.CHANGE_PRIORITY) {
    return (
      <Card p={0} shadow="md">
        <Stack gap={3} py={8}>
          <Text fz={13}>
            <Trans>Change priority</Trans>
          </Text>

          {Object.values(TaskPriority).map((priority) => {
            const priorityConstant = taskPriorities[priority];
            return (
              <Group
                className={styles.TaskMenuItem}
                gap={6}
                pr={16}
                pl={8}
                py={6}
                align="center"
                onClick={() => {
                  onClose();
                  updateTasks({
                    _id: task._id,
                    priority: priority,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              >
                <IconFlagFilled size={16} color={color(priorityConstant.color)} />
                <Text fz={13}>{priorityConstant.label()}</Text>
              </Group>
            );
          })}
        </Stack>
      </Card>
    );
  }

  if (action === TaskMenuAction.CHANGE_STATUS) {
    return (
      <Card p={0} shadow="md">
        <Stack gap={3} py={8}>
          {statuses.map((status) => {
            return (
              <Fragment key={status.id}>
                {status.id === DefaultTaskStatusId.CLOSED && (
                  <Divider my={3} miw="100%" opacity={0.5} />
                )}

                <Stack px={8}>
                  <Group
                    className={styles.TaskMenuItem}
                    gap={6}
                    pr={16}
                    pl={8}
                    py={6}
                    align="center"
                    onClick={() => {
                      onClose();
                      updateTasks({
                        _id: task._id,
                        status: status.id,
                        context: { fromGroupVariables: groupVariables },
                      });
                    }}
                  >
                    <TaskStatusIcon size={16} color={status.color} id={status.id} />
                    <Text fz={13}>{status.name}</Text>
                  </Group>
                </Stack>
              </Fragment>
            );
          })}
        </Stack>
      </Card>
    );
  }

  return (
    <Card p={0} shadow="md">
      <Stack gap={0} p={5}>
        <MenuItem
          icon={IconMaximize}
          label={<Trans>View detail</Trans>}
          onClick={() => {
            router.push(updateTaskPath(location.pathname, { code: task.code }));
            onClose();
          }}
        />

        <MenuItem
          icon={IconClockHour3}
          label={<Trans>Clear time</Trans>}
          onClick={() => {
            onClose();
            updateTasks({
              _id: task._id,
              startDate: null,
              dueDate: null,
              context: { fromGroupVariables: groupVariables },
            });
          }}
        />
      </Stack>
    </Card>
  );
};

export const TaskMenuDropdown: FC = ({}) => {
  const [taskMenu, setTaskMenu] = useState<TaskMenu>();

  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  const onClose = () => {
    if (menuRef.current) {
      menuRef.current.classList.remove(styles.AnimatedIn);
      menuRef.current?.style.setProperty("display", "none");
      menuRef.current?.style.removeProperty("left");
      menuRef.current?.style.removeProperty("top");
      menuRef.current?.classList.remove(styles.AnimatedOut);
    }

    setTaskMenu(undefined);
  };

  useEffect(() => {
    if (taskMenu && menuRef.current) {
      const placeMenu = () => {
        const { x, y } = taskMenu.target.getBoundingClientRect();
        const { height } = taskMenu.target.getBoundingClientRect();
        const placeX = taskMenu.position?.x ?? x + (taskMenu.offset?.x ?? 0);
        const placeY = taskMenu.position?.y ?? y + height + (taskMenu.offset?.y ?? 0);
        menuRef.current?.style.setProperty("left", `${placeX}px`);
        menuRef.current?.style.setProperty("top", `${placeY}px`);
      };

      placeMenu();

      // Make menu visible and trigger animation
      menuRef.current.style.setProperty("display", "block");
      // Use requestAnimationFrame to ensure the display change is applied before animation
      requestAnimationFrame(() => {
        menuRef.current?.classList.add(styles.AnimatedIn);
      });

      const onMouseDown = (e: MouseEvent) => {
        if (e.target && !menuRef.current?.contains(e.target as Node)) {
          onClose();
        }
      };

      rootRef.current?.addEventListener("scroll", onClose);
      document.addEventListener("mousedown", onMouseDown);
      window.addEventListener("resize", placeMenu);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", onKeyDown);

      return () => {
        onClose();
        document.removeEventListener("mousedown", onMouseDown);
        rootRef.current?.removeEventListener("scroll", placeMenu);
        window.removeEventListener("resize", placeMenu);
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [menuRef.current, taskMenu, onClose]);

  useEffect(() => {
    const onMenuOpen = (event: unknown) => {
      const { menu } = event as { menu: TaskMenu };
      setTaskMenu(menu);
    };

    const onMenuSetRoot = (event: unknown) => {
      const { root } = event as { root: HTMLElement };
      rootRef.current = root;
    };

    addInternalEventsListener(InternalEvent.TASK_MENU_OPEN, onMenuOpen);
    addInternalEventsListener(InternalEvent.TASK_MENU_SET_ROOT, onMenuSetRoot);

    return () => {
      removeInternalEventsListner(InternalEvent.TASK_MENU_OPEN, onMenuOpen);
      removeInternalEventsListner(InternalEvent.TASK_MENU_SET_ROOT, onMenuSetRoot);
    };
  }, []);

  return (
    <Portal>
      <div
        ref={menuRef}
        className={classNames(styles.TaskMenu, styles.TaskMenuDropdown)}
        style={{ display: "none", position: "fixed", zIndex: zIndexes.taskMenu }}
      >
        {taskMenu && <TaskMenuDropdownContent {...taskMenu} onClose={onClose} />}
      </div>
    </Portal>
  );
};
