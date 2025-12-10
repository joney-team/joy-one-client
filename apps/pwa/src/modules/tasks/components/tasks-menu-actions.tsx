"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ButtonPlus } from "@/components/buttons/button-plus";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { PartnerSelector } from "@/modules/partners/components/partner-selector";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useTaskHistories } from "@/modules/tasks/task-history-context";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskPriorityColor } from "@/modules/tasks/tasks-service";
import { TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Loader, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircleCheck,
  IconFlag,
  IconFlagFilled,
  IconFolder,
  IconFolderOpen,
  IconMinus,
  IconPlus,
  IconSettings,
  IconTags,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { type FC } from "react";
import { useTaskFolders } from "../hooks/use-task-folders";
import { taskPriorities } from "../task-constants";
import { useQuery } from "@apollo/client/react";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/graphql/queryTags.graphql";

export const TaskMenuActions: FC = () => {
  const color = useColor();
  const workspace = useWorkspace();
  const tasks = useTasks();
  const taskHistories = useTaskHistories();
  const { folders, exitFolder } = useTaskFolders();

  const taskTags = useQuery<TagsQuery, TagsQueryVariables>(QUERY_TAGS, {
    variables: {
      type: TagType.TASK,
    },
  });

  const [assignees, isAssigneesReady] = useWorkspaceMembers(
    tasks.state.variables?.assigneeUserIds ?? []
  );
  const assigneesHover = useHover();
  const layout = useLayout();
  const tagsHover = useHover();

  const isAbleToUndo =
    taskHistories.histories.length > 0 &&
    taskHistories.histories.findIndex((v) => v.id === taskHistories.pointedHistoryId!) > 0;

  const isAbleToRedo =
    taskHistories.histories.length > 0 &&
    taskHistories.histories.findIndex((v) => v.id === taskHistories.pointedHistoryId!) <
      taskHistories.histories.length - 1;

  const onUndo = () => {
    if (!isAbleToUndo) return;
    const currentIndex = taskHistories.histories.findIndex(
      (v) => v.id === taskHistories.pointedHistoryId!
    );
    return taskHistories.switchHistory(taskHistories.histories[currentIndex - 1].id, "prev");
  };

  const onRedo = () => {
    if (!isAbleToRedo) return;
    const currentIndex = taskHistories.histories.findIndex(
      (v) => v.id === taskHistories.pointedHistoryId!
    );
    return taskHistories.switchHistory(taskHistories.histories[currentIndex + 1].id, "next");
  };

  return (
    <Group justify="space-between" wrap="nowrap" flex={1}>
      <Group gap={10}>
        <ModalCreateTask>
          {(modalCreateTask) => (
            <ButtonPlus iconSize={16} size={26} onClick={() => modalCreateTask.open()} />
          )}
        </ModalCreateTask>

        {layout.view === "mobile" && (
          <ButtonSelect
            icon={IconFolder}
            label={<Trans>Folder</Trans>}
            autoHideLabel
            value={tasks.activatedFolder?._id}
            options={folders.map((tagFolder) => ({
              value: tagFolder._id,
              label: tagFolder.name,
              icon: tasks.activatedFolder?._id === tagFolder._id ? IconFolderOpen : IconFolder,
              activeColor: tagFolder.color || "primary",
            }))}
            onChange={(value) => tasks.openFolder(folders.find((v) => v._id === value)!)}
            onClear={exitFolder}
          />
        )}

        {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
          <ButtonSelect
            icon={IconSettings}
            label={<Trans>Settings</Trans>}
            onClick={() => OnTaskSatusesModal()}
          />
        )}

        <WorkspaceMemberSelector
          onSelect={(user) => {
            if (!user) return;
            tasks.setState((s) => {
              const assigneeUserIds = s.variables?.assigneeUserIds?.includes(user.userId)
                ? (s.variables?.assigneeUserIds ?? []).filter((id) => id !== user.userId)
                : [...(s.variables?.assigneeUserIds || []), user.userId];

              return {
                ...s,
                variables: {
                  ...s.variables,
                  assigneeUserIds: assigneeUserIds.length > 0 ? assigneeUserIds : null,
                },
              };
            });
          }}
          optionRightSection={(user) => {
            const isSelected = tasks.state.variables?.assigneeUserIds?.includes(user.userId);

            return (
              <Group>
                <ThemeIcon
                  radius={100}
                  variant="transparent"
                  color="var(--mantine-color-dimmed)"
                  size="sm"
                >
                  {isSelected ? <IconMinus size={16} /> : <IconPlus size={16} />}
                </ThemeIcon>
              </Group>
            );
          }}
          target={(ctx) => {
            const isHasAssignee =
              tasks.state.variables?.assigneeUserIds &&
              tasks.state.variables?.assigneeUserIds.length > 0;

            return (
              <Group
                justify="space-between"
                style={{ position: "relative" }}
                ref={assigneesHover.ref}
              >
                <Button
                  onClick={ctx.toggle}
                  size="compact-sm"
                  color={isHasAssignee ? "primary" : "var(--mantine-color-dimmed)"}
                  variant="outline"
                  radius={100}
                  leftIcon={IconUsers}
                >
                  <Group gap={5}>
                    <Text fz={12} fw={500}>
                      <Trans>Assignee</Trans>
                    </Text>

                    {!isAssigneesReady ? (
                      <Loader size={13} type="dots" color="var(--mantine-color-dimmed)" />
                    ) : (
                      isHasAssignee && (
                        <Group gap={5} mr={0}>
                          {tasks.state.variables?.assigneeUserIds?.map((userId, i) => {
                            const assignee = assignees.find(
                              (assignee) => assignee.userId === userId
                            );
                            if (!assignee) return null;

                            return (
                              <Group key={userId} ml={i > 0 ? -10 : 0}>
                                <Tooltip label={assignee.name}>
                                  <Avatar
                                    key={userId}
                                    user={assignee}
                                    size={20}
                                    withBorder={color({ light: "gray.6", dark: "gray.5" })}
                                  />
                                </Tooltip>
                              </Group>
                            );
                          })}
                        </Group>
                      )
                    )}
                  </Group>
                </Button>

                {isHasAssignee && assigneesHover.hovered && (
                  <ThemeIcon
                    color="dark.2"
                    radius={100}
                    size={16}
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      border: `1px solid white`,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      tasks.setState((s) => ({
                        ...s,
                        variables: {
                          ...s.variables,
                          assigneeUserIds: null,
                        },
                      }));
                    }}
                  >
                    <IconX size={7} strokeWidth={4} />
                  </ThemeIcon>
                )}
              </Group>
            );
          }}
        />

        <PartnerSelector
          createable={false}
          onSelect={(partner) => {
            if (partner) {
              tasks.setState((s) => {
                const partnerIds = s.variables?.partnerIds?.includes(partner._id)
                  ? (s.variables?.partnerIds ?? []).filter((id) => id !== partner._id)
                  : [...(s.variables?.partnerIds || []), partner._id];

                return {
                  ...s,
                  variables: {
                    ...s.variables,
                    partnerIds: partnerIds.length > 0 ? partnerIds : null,
                  },
                };
              });
            }
          }}
          optionRightSection={(partner) => {
            const isSelected = tasks.state.variables?.partnerIds?.includes(partner._id);

            return (
              <Group>
                <ThemeIcon
                  variant="transparent"
                  radius={100}
                  color={!isSelected ? "primary" : "var(--mantine-color-dimmed)"}
                >
                  {isSelected ? <IconMinus size={18} /> : <IconPlus size={18} />}
                </ThemeIcon>
              </Group>
            );
          }}
          target={(ctx) => {
            const selectedPartnerIds = tasks.state.variables?.partnerIds ?? [];

            return (
              <ButtonSelect
                icon={IconUsers}
                label={<Trans>Partners</Trans>}
                autoHideLabel
                onClick={ctx.toggle}
                isActive={selectedPartnerIds.length > 0}
                quantity={selectedPartnerIds.length}
                value={tasks.state.variables?.partnerIds}
                onClear={() =>
                  tasks.setState((s) => ({ ...s, variables: { ...s.variables, partnerIds: null } }))
                }
              />
            );
          }}
        />

        <TagSelector
          type={TagType.TASK}
          excludeIds={tasks.state.variables?.tagIds ?? []}
          createable={false}
          onSelect={(tag) => {
            if (tag) {
              tasks.setState((s) => {
                const tagIds = s.variables?.tagIds?.includes(tag._id)
                  ? (s.variables?.tagIds ?? []).filter((id) => id !== tag._id)
                  : [...(s.variables?.tagIds || []), tag._id];

                return {
                  ...s,
                  variables: {
                    ...s.variables,
                    tagIds: tagIds.length > 0 ? tagIds : null,
                  },
                };
              });
            } else {
              tasks.setState((s) => ({ ...s, variables: { ...s.variables, tagIds: null } }));
            }
          }}
          target={(ctx) => {
            const selectedTags = (tasks.state.variables?.tagIds ?? [])
              .map((tagId) => taskTags.data?.tags.data.find((tag) => tag._id === tagId))
              .filter((v) => typeof v !== "undefined");

            const isHasTag = selectedTags && selectedTags.length > 0;

            return (
              <Group style={{ position: "relative" }} ref={tagsHover.ref}>
                <Button
                  onClick={ctx.toggle}
                  size="compact-sm"
                  color={isHasTag ? "primary" : "var(--mantine-color-dimmed)"}
                  variant="outline"
                  radius={100}
                  leftIcon={IconTags}
                >
                  <Group gap={5}>
                    <Text fz={12} fw={500}>
                      <Trans>Tags</Trans>
                    </Text>
                    <Renderer visible={!!isHasTag}>
                      <Group gap={3} wrap="nowrap">
                        {selectedTags.map((tag) => (
                          <TaskTag
                            key={tag._id}
                            id={tag._id}
                            h={18}
                            fz={12}
                            editable={false}
                            onRemove={() => {
                              tasks.setState((s) => ({
                                ...s,
                                variables: {
                                  ...s.variables,
                                  tagIds: s.variables?.tagIds?.filter((id) => id !== tag._id),
                                },
                              }));
                            }}
                          />
                        ))}
                      </Group>
                    </Renderer>
                  </Group>
                </Button>

                {isHasTag && tagsHover.hovered && (
                  <ThemeIcon
                    color="dark.2"
                    radius={100}
                    size={16}
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      border: `1px solid white`,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      tasks.setState((s) => ({
                        ...s,
                        variables: { ...s.variables, tagIds: null },
                      }));
                    }}
                  >
                    <IconX size={7} strokeWidth={4} />
                  </ThemeIcon>
                )}
              </Group>
            );
          }}
        />

        <ButtonSelect
          icon={IconFlag}
          label={<Trans>Priority</Trans>}
          autoHideLabel
          value={tasks.state.variables?.priority}
          options={Object.values(TaskPriority)
            .reverse()
            .map((priority) => ({
              value: priority,
              label: taskPriorities[priority as TaskPriority]?.label() || "",
              icon: IconFlagFilled,
              activeColor: getTaskPriorityColor(priority),
            }))}
          onChange={(value) =>
            tasks.setState((s) => ({
              ...s,
              variables: { ...s.variables, priority: value as TaskPriority },
            }))
          }
          onClear={() =>
            tasks.setState((s) => ({ ...s, variables: { ...s.variables, priority: null } }))
          }
        />

        <ButtonSelect
          icon={IconCircleCheck}
          label={tasks.state.showClosed ? <Trans>Hide closed</Trans> : <Trans>Show closed</Trans>}
          isActive={tasks.state.showClosed}
          iconStrokeWidth={1.8}
          onClick={() => {
            tasks.setState((s) => ({
              ...s,
              showClosed: tasks.state.showClosed ? undefined : true,
            }));
          }}
        />
      </Group>

      <Group>
        <Renderer visible={isAbleToUndo || isAbleToRedo}>
          <Card
            bg="transparent"
            radius={100}
            p={0}
            withBorder
            style={{ borderColor: color("gray.5") }}
          >
            <Group gap={0}>
              <Tooltip label={<Trans>Undo</Trans>}>
                <ActionIcon
                  disabled={!isAbleToUndo}
                  variant="subtle"
                  color="gray"
                  style={{ borderRadius: "100px 0 0 100px" }}
                  size={28}
                  pl={3}
                  onClick={onUndo}
                >
                  <IconArrowBackUp size={16} strokeWidth={2} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={<Trans>Redo</Trans>}>
                <ActionIcon
                  disabled={!isAbleToRedo}
                  variant="subtle"
                  color="gray"
                  style={{ borderRadius: "0 100px 100px 0" }}
                  size={28}
                  pr={3}
                  onClick={onRedo}
                >
                  <IconArrowForwardUp size={16} strokeWidth={2} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Card>
        </Renderer>
      </Group>
    </Group>
  );
};
