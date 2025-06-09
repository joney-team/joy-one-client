"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { TagSelector } from "@/components/selector/tag-selector";
import { TaskPrioritySelector } from "@/components/selector/task-priority-selector";
import { TaskStatusSelector } from "@/components/selector/task-status-selector";
import { TaskTagFolderSelector } from "@/components/selector/task-tag-folder-selector";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { num, t } from "@/modules/lang/lang-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskEntites, getTaskEntity, updateTasks } from "@/modules/tasks/tasks-service";
import { TaskPriority, TaskStatus } from "@/modules/tasks/tasks-types";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/workspace-member-selector";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { capitalize } from "@/utils/string.utils";
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
import { FC } from "react";

export const BulkTasksActions: FC = () => {
  const tasks = useTasks();
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();

  const removeAll = () => {
    const selectedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);
    updateTasks(selectedTasks.map((task) => ({ ...task, isArchived: true })));
    tasks.removeSelectedTasks();
  };

  const assignTask = (user: WorkspaceMember) => {
    const selectedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);
    updateTasks(
      selectedTasks.map((task) => ({
        ...task,
        assigneeUserIds: [...new Set([...(task.assigneeUserIds || []), user.userId])],
      }))
    );
  };

  const changeStatus = (status: TaskStatus) => {
    const selectedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);
    updateTasks(selectedTasks.map((task) => ({ ...task, status: status.id })));
  };

  const changeFolder = (tagFolder?: TagEntity) => {
    const relatedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);
    relatedTasks.forEach((task) => {
      const childTasks = getTaskEntites().filter((v) => v.parentId === task._id);
      childTasks.forEach((child) => relatedTasks.push(child));
    });

    updateTasks(relatedTasks.map((task) => ({ ...task, tagFolderId: tagFolder?._id })));
  };

  const setTag = (tag?: TagEntity) => {
    if (!tag) return;
    const selectedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);

    if (selectedTasks.every((task) => task.tagIds?.includes(tag._id))) {
      return updateTasks(
        selectedTasks.map((task) => ({ ...task, tagIds: task.tagIds?.filter((id) => id !== tag._id) }))
      );
    }

    updateTasks(selectedTasks.map((task) => ({ ...task, tagIds: [...new Set([...(task.tagIds || []), tag._id])] })));
  };

  const changePriority = (priority: TaskPriority) => {
    const selectedTasks = tasks.selectedTaskIds.map((id) => getTaskEntity(id)!).filter((task) => !!task);
    updateTasks(selectedTasks.map((task) => ({ ...task, priority: priority })));
  };

  if (tasks.selectedTaskIds.length === 0) return null;

  return (
    <Group
      style={{
        position: "fixed",
        bottom: workspaceLayout.navigationHeight + 16 * 1.5,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
      }}
    >
      <Card withBorder shadow="none" py={0} pr={8} radius={100} bg={"dark"}>
        <Group h={45} align="center" justify="space-between" gap={5} wrap="nowrap">
          <IconStack2 size={20} strokeWidth={1.5} color="white" />
          <Group gap={3} wrap="nowrap">
            <Text c="white" fz={14} fw={600} miw={10}>
              {num(tasks.selectedTaskIds.length)}
            </Text>
            <Text c="white" fz={14} fw={600}>
              {t("selected")}
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
                  <Tooltip label={capitalize(`${t("change")} ${t("status")}`)}>
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
                      {t("status")}
                    </Button>
                  </Tooltip>
                );
              }}
            />

            <WorkspaceMemberSelector
              onSelect={assignTask}
              render={(ctx) => {
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
                    {t("assign_task")}
                  </Button>
                );
              }}
            />

            <TagSelector
              type={TagType.TASK}
              excludeIds={tasks.state.tagIds}
              onSelect={setTag}
              render={(ctx) => {
                return (
                  <Tooltip label={t("set_tag")}>
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
                      {t("tags")}
                    </Button>
                  </Tooltip>
                );
              }}
            />

            <TaskTagFolderSelector
              onSelect={changeFolder}
              render={(ctx) => {
                return (
                  <Tooltip label={capitalize(`${t("change")} ${t("folder")}`)}>
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
                      {t("move")}
                    </Button>
                  </Tooltip>
                );
              }}
            />

            <TaskPrioritySelector
              onSelect={changePriority}
              render={(ctx) => {
                return (
                  <Tooltip label={t("set_priority")}>
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
                      {t("priority")}
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
              {t("remove")}
            </Button>

            <Tooltip label={t("unselect_all")}>
              <ActionIcon color="gray" variant="subtle" radius={100} onClick={() => tasks.removeSelectedTasks()}>
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
                  {t("remove_all")}
                </Menu.Item>

                <TaskStatusSelector
                  onSelect={changeStatus}
                  render={(ctx) => {
                    return (
                      <Menu.Item leftSection={<IconPlaystationCircle size={18} />} onClick={ctx.toggle}>
                        {capitalize(`${t("change")} ${t("status")}`)}
                      </Menu.Item>
                    );
                  }}
                />

                <WorkspaceMemberSelector
                  onSelect={assignTask}
                  render={(ctx) => {
                    return (
                      <Menu.Item leftSection={<IconUsersPlus size={18} />} onClick={ctx.toggle}>
                        {t("assign_task")}
                      </Menu.Item>
                    );
                  }}
                />

                <TaskTagFolderSelector
                  onSelect={changeFolder}
                  render={(ctx) => {
                    return (
                      <Menu.Item leftSection={<IconFolder size={18} />} onClick={ctx.toggle}>
                        {t("move")}
                      </Menu.Item>
                    );
                  }}
                />

                <TaskPrioritySelector
                  onSelect={changePriority}
                  render={(ctx) => {
                    return (
                      <Menu.Item leftSection={<IconFlagFilled size={18} />} onClick={ctx.toggle}>
                        {t("set_priority")}
                      </Menu.Item>
                    );
                  }}
                />

                <Menu.Item leftSection={<IconX size={18} />} onClick={() => tasks.removeSelectedTasks()}>
                  {t("unselect_all")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Renderer>
        </Group>
      </Card>
    </Group>
  );
};
