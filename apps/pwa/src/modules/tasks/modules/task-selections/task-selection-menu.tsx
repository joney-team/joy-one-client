"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { ModalConfirm, type ModalConfirmRef } from "@/modals/modal-confirm";
import type { TagEntity } from "@/modules/tags/tags-types";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { isDiff } from "@joy-one-client/utils/object";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Center, Divider, Group, Menu, Text, Tooltip } from "@mantine/core";
import {
  IconDots,
  IconFlagFilled,
  IconFolder,
  IconPlaystationCircle,
  IconStack2,
  IconTags,
  IconTrash,
  IconUsersPlus,
  IconX,
} from "@tabler/icons-react";
import { FC, Fragment, useMemo, useRef } from "react";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { useTaskMenu } from "../task-menu/task-menu";
import { TaskMenuAction } from "../task-menu/task-menu-types";
import { useTaskSelections } from "./task-selections-context";

export const TaskSelectionMenu: FC = () => {
  const selections = useTaskSelections();
  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const { updateTasks } = useUpdateTasks();

  const removeAll = () => {
    modalConfirmRef.current?.open({
      content: <Trans>Are you sure you want to remove all selected tasks?</Trans>,
      onConfirm: async () => {
        await updateTasks(selections.selected.map((task) => ({ _id: task._id, isArchived: true })));
        selections.unselect(...selections.selected.map((v) => v._id));
      },
    });
  };

  const changeFolder = async (folder?: TagEntity) => {
    if (!folder) return;
    await updateTasks(selections.selected.map(({ _id }) => ({ _id, folder: folder })));
  };

  const statuses = useMemo(() => {
    if (!selections.selected[0]) return [];

    const firstTaskStatuses = selections.selected[0].statuses;

    const isAllSameStatuses = selections.selected.every(
      (task) => !isDiff(task.statuses, firstTaskStatuses)
    );

    if (isAllSameStatuses) return selections.selected[0].statuses;
    return [];
  }, []);

  const taskMenu = useTaskMenu({
    task: {
      _id: "selection-menu",
      statuses,
    },
    groupVariables: null,
    updateTask: async (task) => {
      if ("status" in task && task.status) {
        await updateTasks(
          selections.selected.map(({ _id }) => ({
            _id,
            status: task.status,
          }))
        );
      }

      if ("priority" in task) {
        await updateTasks(
          selections.selected.map(({ _id }) => ({
            _id,
            priority: task.priority,
          }))
        );
      }

      if ("tags" in task && task.tags) {
        await updateTasks(
          selections.selected.map(({ _id }) => ({
            _id,
            tags: task.tags,
          }))
        );
      }

      if ("folder" in task) {
        await updateTasks(
          selections.selected.map(({ _id }) => ({
            _id,
            folder: task.folder ?? null,
          }))
        );
        taskMenu.close();
        selections.unselect(...selections.selected.map((v) => v._id));
      }

      if ("assigneeUsers" in task && task.assigneeUsers) {
        await updateTasks(
          selections.selected.map(({ _id }) => ({
            _id,
            assigneeUsers: task.assigneeUsers,
          }))
        );
      }

      emitInternalEvent(InternalEvent.REFETCH_TASKS);
    },
  });

  if (selections.selected.length === 0) return null;

  return (
    <Fragment>
      <Group
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}
      >
        <Card withBorder shadow="none" py={0} pr={8} radius={100} bg={"dark"}>
          <Group h={40} align="center" justify="space-between" gap={5} wrap="nowrap">
            <IconStack2 size={18} strokeWidth={1.5} color="white" />
            <Group gap={3} wrap="nowrap">
              <Text c="white" fz={12} fw={600} miw={10}>
                <NumberFormat value={selections.selected.length} />
              </Text>
              <Text c="white" fz={12} fw={600}>
                <Trans>selected</Trans>
              </Text>
            </Group>

            <Renderer views={["desktop", "tablet"]}>
              <Center>
                <Divider orientation="vertical" h={18} opacity={0.5} mx={8} />
              </Center>

              {statuses.length > 0 && (
                <Tooltip
                  label={<Trans>Change status</Trans>}
                  position="bottom"
                  disabled={taskMenu.isOpened}
                >
                  <Button
                    onClick={(e) =>
                      taskMenu.open({
                        action: TaskMenuAction.CHANGE_STATUS,
                        target: e.currentTarget,
                      })
                    }
                    leftIcon={IconPlaystationCircle}
                    color="gray"
                    variant="transparent"
                    radius={100}
                    px={8}
                  >
                    <Trans>Status</Trans>
                  </Button>
                </Tooltip>
              )}

              <Tooltip label={<Trans>Assign task to members</Trans>} disabled={taskMenu.isOpened}>
                <Button
                  leftIcon={IconUsersPlus}
                  color="gray"
                  variant="transparent"
                  radius={100}
                  px={8}
                  onClick={(e) =>
                    taskMenu.open({
                      action: TaskMenuAction.CHANGE_ASSIGNEE,
                      target: e.currentTarget,
                    })
                  }
                >
                  <Trans>Assign task</Trans>
                </Button>
              </Tooltip>

              <Tooltip
                label={<Trans>Set tag</Trans>}
                position="bottom"
                disabled={taskMenu.isOpened}
              >
                <Button
                  onClick={(e) =>
                    taskMenu.open({
                      action: TaskMenuAction.CHANGE_TAGS,
                      target: e.currentTarget,
                    })
                  }
                  leftIcon={IconTags}
                  color="gray"
                  variant="transparent"
                  px={8}
                  radius={100}
                >
                  <Trans>Tags</Trans>
                </Button>
              </Tooltip>

              <Tooltip
                label={<Trans>Change folder</Trans>}
                position="bottom"
                disabled={taskMenu.isOpened}
              >
                <Button
                  onClick={(e) =>
                    taskMenu.open({
                      action: TaskMenuAction.CHANGE_FOLDER,
                      target: e.currentTarget,
                    })
                  }
                  leftIcon={IconFolder}
                  color="gray"
                  variant="transparent"
                  px={8}
                  radius={100}
                >
                  <Trans>Folder</Trans>
                </Button>
              </Tooltip>

              <Tooltip
                label={<Trans>Set priority</Trans>}
                position="bottom"
                disabled={taskMenu.isOpened}
              >
                <Button
                  leftIcon={IconFlagFilled}
                  color="gray"
                  variant="transparent"
                  px={8}
                  radius={100}
                  onClick={(e) =>
                    taskMenu.open({
                      action: TaskMenuAction.CHANGE_PRIORITY,
                      target: e.currentTarget,
                    })
                  }
                >
                  <Trans>Priority</Trans>
                </Button>
              </Tooltip>

              <Button
                leftIcon={IconTrash}
                color="red"
                variant="transparent"
                px={8}
                radius={100}
                onClick={removeAll}
              >
                <Trans>Remove</Trans>
              </Button>

              <Tooltip label={<Trans>Unselect all</Trans>} position="bottom">
                <ActionIcon
                  color="gray"
                  variant="subtle"
                  radius={100}
                  onClick={() => selections.unselect(...selections.selected.map((v) => v._id))}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            </Renderer>

            <Renderer views={["mobile"]}>
              <Menu position="top" closeOnItemClick={false} offset={16 * 1.5}>
                <Menu.Target>
                  <ActionIcon variant="transparent" size="lg" radius={100} color="white" px={8}>
                    <IconDots size={18} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconTrash size={18} />} onClick={removeAll}>
                    <Trans>Remove all</Trans>
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconPlaystationCircle size={18} />}
                    onClick={(e) =>
                      taskMenu.open({
                        action: TaskMenuAction.CHANGE_STATUS,
                        target: e.currentTarget,
                      })
                    }
                  >
                    <Trans>Change status</Trans>
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconUsersPlus size={18} />}
                    onClick={(e) =>
                      taskMenu.open({
                        action: TaskMenuAction.CHANGE_ASSIGNEE,
                        target: e.currentTarget,
                      })
                    }
                  >
                    <Trans>Assign task</Trans>
                  </Menu.Item>

                  <TaskTagFolderSelector
                    onSelect={changeFolder}
                    render={(ctx) => {
                      return (
                        <Menu.Item leftSection={<IconFolder size={18} />} onClick={ctx.toggle}>
                          <Trans>Move</Trans>
                        </Menu.Item>
                      );
                    }}
                  />

                  <Menu.Item
                    leftSection={<IconFlagFilled size={18} />}
                    onClick={(e) =>
                      taskMenu.open({
                        action: TaskMenuAction.CHANGE_PRIORITY,
                        target: e.currentTarget,
                      })
                    }
                  >
                    <Trans>Set priority</Trans>
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconX size={18} />}
                    onClick={() => selections.unselect(...selections.selected.map((v) => v._id))}
                  >
                    <Trans>Unselect all</Trans>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Renderer>
          </Group>
        </Card>
      </Group>

      <ModalConfirm ref={modalConfirmRef} />
    </Fragment>
  );
};
