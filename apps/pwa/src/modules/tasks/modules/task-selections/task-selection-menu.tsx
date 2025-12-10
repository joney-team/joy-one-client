"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { ModalConfirm, type ModalConfirmRef } from "@/modals/modal-confirm";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { TaskStatusSelector } from "@/modules/tasks/components/task-status-selector";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { TaskPriority, TaskStatus } from "@/modules/tasks/tasks-types";
import {
  WorkspaceMemberSelector,
  WorkspaceMemberSelectorValue,
} from "@/modules/workspace-members/components/workspace-member-selector";
import { useApolloClient } from "@apollo/client/react";
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
import { FC, Fragment, useCallback, useRef } from "react";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import TASK_FRAGMENT, { type TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useTaskSelections } from "./task-selections-context";

export const TaskSelectionMenu: FC = () => {
  const client = useApolloClient();
  const selections = useTaskSelections();
  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const { updateTasks } = useUpdateTasks();

  const removeAll = () => {
    modalConfirmRef.current?.open({
      content: <Trans>Are you sure you want to remove all selected tasks?</Trans>,
      onConfirm: async () => {
        await updateTasks(selections.selected.map((task) => ({ _id: task._id, isArchived: true })));
        selections.unselect(...selections.selected.map((v) => v._id));
        emitInternalEvent(InternalEvent.REFETCH_TASKS);
      },
    });
  };

  const getCurrentTask = useCallback(
    (id: string) => {
      const identifiedId = client.cache.identify({
        __typename: "Task",
        _id: id,
      });

      return client.cache.readFragment<TaskDataFragment>({
        id: identifiedId,
        fragment: TASK_FRAGMENT,
      });
    },
    [client]
  );

  const assignMember = async (user?: WorkspaceMemberSelectorValue | null) => {
    if (!user) return;
    await updateTasks(
      selections.selected
        .map(({ _id }) => {
          const currentData = getCurrentTask(_id);

          if (!currentData || currentData.assigneeUsers.some((v) => v.userId === user.userId))
            return null;

          return {
            _id,
            assigneeUsers: [...currentData.assigneeUsers, user as any],
          };
        })
        .filter((v) => v != null)
    );
    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  };

  const changeStatus = async (status: TaskStatus) => {
    await updateTasks(
      selections.selected
        .map(({ _id }) => {
          const currentData = getCurrentTask(_id);
          if (!currentData) return null;
          return {
            _id,
            status: status.id,
          };
        })
        .filter((v) => v != null)
    );
    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  };

  const changeFolder = async (tagFolder?: TagEntity) => {
    if (!tagFolder) return;

    await updateTasks(
      selections.selected
        .map(({ _id }) => {
          const currentData = getCurrentTask(_id);
          if (!currentData) return null;
          return {
            _id,
            folder: tagFolder,
          };
        })
        .filter((v) => v != null)
    );
    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  };

  const setTag = async (tag?: TagEntity | null) => {
    if (!tag) return;

    await updateTasks(
      selections.selected
        .map(({ _id }) => {
          const currentData = getCurrentTask(_id);
          if (!currentData) return null;
          return {
            _id,
            tags: [...currentData.tags, tag],
          };
        })
        .filter((v) => v != null)
    );
    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  };

  const changePriority = async (priority: TaskPriority) => {
    await updateTasks(
      selections.selected
        .map(({ _id }) => {
          const currentData = getCurrentTask(_id);
          if (!currentData) return null;
          return {
            _id,
            priority: priority,
          };
        })
        .filter((v) => v != null)
    );
    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  };

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
          <Group h={45} align="center" justify="space-between" gap={5} wrap="nowrap">
            <IconStack2 size={18} strokeWidth={1.5} color="white" />
            <Group gap={3} wrap="nowrap">
              <Text c="white" fz={12} fw={600} miw={10}>
                <NumberFormat value={selections.selected.length} />
              </Text>
              <Text c="white" fz={12} fw={600}>
                <Trans>Selected</Trans>
              </Text>
            </Group>

            <Renderer views={["desktop", "tablet"]}>
              <Center>
                <Divider orientation="vertical" h={18} opacity={0.5} mx={8} />
              </Center>

              <TaskStatusSelector
                onSelect={changeStatus}
                render={(ctx) => {
                  return (
                    <Tooltip label={<Trans>Change status</Trans>} position="bottom">
                      <Button
                        onClick={ctx.toggle}
                        leftIcon={IconPlaystationCircle}
                        iconSize={18}
                        size="compact-md"
                        h={32}
                        color="gray.5"
                        variant="transparent"
                        radius={100}
                        fz={12}
                      >
                        <Trans>Status</Trans>
                      </Button>
                    </Tooltip>
                  );
                }}
              />

              <WorkspaceMemberSelector
                onSelect={assignMember}
                target={(ctx) => {
                  return (
                    <Button
                      leftIcon={IconUsersPlus}
                      iconSize={18}
                      size="compact-md"
                      h={32}
                      color="gray.5"
                      variant="transparent"
                      radius={100}
                      fz={12}
                      onClick={ctx.toggle}
                    >
                      <Trans>Assign task</Trans>
                    </Button>
                  );
                }}
              />

              <TagSelector
                type={TagType.TASK}
                onSelect={setTag}
                target={(ctx) => {
                  return (
                    <Tooltip label={<Trans>Set tag</Trans>} position="bottom">
                      <Button
                        onClick={ctx.toggle}
                        leftIcon={IconTags}
                        iconSize={18}
                        size="compact-md"
                        h={32}
                        color="gray.5"
                        variant="transparent"
                        radius={100}
                        fz={12}
                      >
                        <Trans>Tags</Trans>
                      </Button>
                    </Tooltip>
                  );
                }}
              />

              <TaskTagFolderSelector
                onSelect={changeFolder}
                render={(ctx) => {
                  return (
                    <Tooltip label={<Trans>Change folder</Trans>} position="bottom">
                      <Button
                        leftIcon={IconFolder}
                        iconSize={18}
                        size="compact-md"
                        h={32}
                        color="gray.5"
                        variant="transparent"
                        radius={100}
                        fz={12}
                        onClick={ctx.toggle}
                      >
                        <Trans>Move</Trans>
                      </Button>
                    </Tooltip>
                  );
                }}
              />

              <TaskPrioritySelector
                onSelect={changePriority}
                render={(ctx) => {
                  return (
                    <Tooltip label={<Trans>Set priority</Trans>} position="bottom">
                      <Button
                        leftIcon={IconFlagFilled}
                        iconSize={18}
                        size="compact-md"
                        h={32}
                        color="gray.5"
                        variant="transparent"
                        radius={100}
                        fz={12}
                        onClick={ctx.toggle}
                      >
                        <Trans>Priority</Trans>
                      </Button>
                    </Tooltip>
                  );
                }}
              />

              <Button
                leftIcon={IconTrash}
                iconSize={18}
                size="compact-md"
                h={32}
                color="red.5"
                variant="transparent"
                radius={100}
                fz={12}
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
                  <IconX size={18} />
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

                  <TaskStatusSelector
                    onSelect={changeStatus}
                    render={(ctx) => {
                      return (
                        <Menu.Item
                          leftSection={<IconPlaystationCircle size={18} />}
                          onClick={ctx.toggle}
                        >
                          <Trans>Change status</Trans>
                        </Menu.Item>
                      );
                    }}
                  />

                  <WorkspaceMemberSelector
                    onSelect={assignMember}
                    target={(ctx) => {
                      return (
                        <Menu.Item leftSection={<IconUsersPlus size={18} />} onClick={ctx.toggle}>
                          <Trans>Assign task</Trans>
                        </Menu.Item>
                      );
                    }}
                  />

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

                  <TaskPrioritySelector
                    onSelect={changePriority}
                    render={(ctx) => {
                      return (
                        <Menu.Item leftSection={<IconFlagFilled size={18} />} onClick={ctx.toggle}>
                          <Trans>Set priority</Trans>
                        </Menu.Item>
                      );
                    }}
                  />

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
