"use client";

import { type FC } from "react";
import { useColor } from "@/modules/theme/use-color";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ButtonPlus } from "@/components/buttons/button-plus";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Renderer } from "@/components/renderer";
import { PartnerSelector } from "@/modules/partners/partner-selector";
import { TagSelector } from "@/components/selector/tag-selector";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/workspace-member-selector";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useLayout } from "@/layout/layout-context";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { t } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { useTaskHistories } from "@/modules/tasks/task-history-context";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskPriorityColor } from "@/modules/tasks/tasks-service";
import { TaskPriority } from "@/modules/tasks/tasks-types";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, Card, Group, Loader, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircleCheck,
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

export const TaskMenuActions: FC = () => {
  const workspace = useWorkspace();
  const tasks = useTasks();
  const taskHistories = useTaskHistories();
  const tags = useTags();

  const color = useColor();

  const [assignees, isAssigneesReady, setAssignee] = useWorkspaceMembers(tasks.state.assigneeUserIds);
  const assigneesHover = useHover();
  const partnersHover = useHover();
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
    const currentIndex = taskHistories.histories.findIndex((v) => v.id === taskHistories.pointedHistoryId!);
    return taskHistories.switchHistory(taskHistories.histories[currentIndex - 1].id, "prev");
  };

  const onRedo = () => {
    if (!isAbleToRedo) return;
    const currentIndex = taskHistories.histories.findIndex((v) => v.id === taskHistories.pointedHistoryId!);
    return taskHistories.switchHistory(taskHistories.histories[currentIndex + 1].id, "next");
  };

  return (
    <Group justify="space-between" wrap="nowrap" flex={1}>
      <Group gap={10}>
        <ButtonPlus onClick={() => OnModalCreateTask()} />

        {layout.view === "mobile" && (
          <ButtonSelect
            icon={IconFolder}
            label={t("folder")}
            autoHideLabel
            value={tasks.tagFolder?._id}
            options={tasks.tagFolders.map((tagFolder) => ({
              value: tagFolder._id,
              label: tagFolder.name,
              icon: tasks.tagFolder?._id === tagFolder._id ? IconFolderOpen : IconFolder,
              activeColor: tagFolder.color || "primary",
            }))}
            onChange={(value) => tasks.openFolder(tasks.tagFolders.find((v) => v._id === value)!)}
            onClear={() => tasks.removeFolder()}
          />
        )}

        {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
          <ButtonSelect
            icon={IconSettings}
            label={t("settings")}
            iconStrokeWidth={1.8}
            onClick={() => OnTaskSatusesModal()}
          />
        )}

        <WorkspaceMemberSelector
          onSelect={(user) =>
            tasks.setState((s) => ({
              ...s,
              assigneeUserIds: s.assigneeUserIds?.includes(user.userId)
                ? s.assigneeUserIds?.filter((id) => id !== user.userId)
                : [...(s.assigneeUserIds || []), user.userId],
            }))
          }
          optionRightSection={(user) => {
            const isSelected = tasks.state.assigneeUserIds?.includes(user.userId);

            return (
              <Group>
                <ThemeIcon radius={100} variant="transparent" color="var(--mantine-color-dimmed)" size="sm">
                  {isSelected ? <IconMinus size={16} /> : <IconPlus size={16} />}
                </ThemeIcon>
              </Group>
            );
          }}
          render={(ctx) => {
            const isHasAssignee = tasks.state.assigneeUserIds && tasks.state.assigneeUserIds.length > 0;

            return (
              <Group justify="space-between" style={{ position: "relative" }} ref={assigneesHover.ref}>
                <Button
                  onClick={ctx.toggle}
                  size="compact-md"
                  h={32}
                  color={isHasAssignee ? "primary" : "var(--mantine-color-dimmed)"}
                  variant="outline"
                  radius={100}
                  fz={12}
                  leftIcon={IconUsers}
                  iconSize={18}
                >
                  <Group gap={5}>
                    <Text fz={12} fw={500}>
                      {t("assignee")}
                    </Text>

                    {!isAssigneesReady ? (
                      <Loader size={13} type="dots" color="var(--mantine-color-dimmed)" />
                    ) : (
                      isHasAssignee && (
                        <Group gap={5} mr={0}>
                          {tasks.state.assigneeUserIds?.map((userId, i) => {
                            const assignee = assignees.find((assignee) => assignee.userId === userId);
                            if (!assignee) return null;

                            return (
                              <Group key={userId} ml={i > 0 ? -10 : 0}>
                                <Tooltip label={assignee.name}>
                                  <Avatar key={userId} user={assignee} size={22} withBorder />
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
                      tasks.setState((s) => ({ ...s, assigneeUserIds: undefined }));
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
              tasks.setState((s) => ({
                ...s,
                partnerIds: s.partnerIds?.includes(partner._id)
                  ? s.partnerIds?.filter((id) => id !== partner._id)
                  : [...(s.partnerIds || []), partner._id],
              }));
            }
          }}
          optionRightSection={(partner) => {
            const isSelected = tasks.state.partnerIds?.includes(partner._id);

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
          renderTrigger={(ctx) => {
            const isHasPartner = tasks.state.partnerIds && tasks.state.partnerIds.length > 0;

            return (
              <Group justify="space-between" style={{ position: "relative" }} ref={partnersHover.ref}>
                <Button
                  onClick={ctx.toggle}
                  size="compact-md"
                  h={32}
                  color={isHasPartner ? "primary" : "var(--mantine-color-dimmed)"}
                  variant="outline"
                  radius={100}
                  fz={12}
                  leftIcon={IconUsers}
                  iconSize={18}
                >
                  <Group gap={5}>
                    <Text fz={12} fw={500}>
                      {t("partners")}
                    </Text>

                    {/* TODO: display partners */}
                    {/* {isHasPartner && <Group gap={5} mr={0}>
                    {tasks.state.partnerIds?.map((partnerId) => {
                      const partner = workspace.partners.find(partner => partner._id === partnerId);
                      if (!partner) return null;
                      return <Tooltip label={partner.name} key={partnerId}>
                        <AppAvatar key={partnerId} partner={partner} size={22} />
                      </Tooltip>
                    })}
                  </Group>} */}
                  </Group>
                </Button>

                {isHasPartner && partnersHover.hovered && (
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
                      tasks.setState((s) => ({ ...s, partnerIds: undefined }));
                    }}
                  >
                    <IconX size={7} strokeWidth={4} />
                  </ThemeIcon>
                )}
              </Group>
            );
          }}
        />

        <TagSelector
          type={TagType.TASK}
          excludeIds={tasks.state.tagIds}
          createable={false}
          onSelect={(tag) => {
            if (tag) {
              tasks.setState((s) => ({
                ...s,
                tagIds: s.tagIds?.includes(tag._id)
                  ? s.tagIds?.filter((id) => id !== tag._id)
                  : [...(s.tagIds || []), tag._id],
              }));
            } else {
              tasks.setState((s) => ({ ...s, tagIds: undefined }));
            }
          }}
          render={(ctx) => {
            const selectedTags = (tasks.state.tagIds || [])
              .map((tagId) => tags.list.find((tag) => tag._id === tagId))
              .filter(Boolean) as TagEntity[];
            const isHasTag = selectedTags && selectedTags.length > 0;

            return (
              <Group style={{ position: "relative" }} ref={tagsHover.ref}>
                <Button
                  onClick={ctx.toggle}
                  size="compact-md"
                  h={32}
                  color={isHasTag ? "primary" : "var(--mantine-color-dimmed)"}
                  variant="outline"
                  radius={100}
                  fz={12}
                  leftIcon={IconTags}
                  iconSize={18}
                >
                  <Group gap={5}>
                    <Text fz={12} fw={500}>
                      {t("tags")}
                    </Text>
                    <Renderer visible={!!isHasTag}>
                      <Group gap={3} wrap="nowrap">
                        {selectedTags.map((tag) => (
                          <TaskTag
                            id={tag._id}
                            h={18}
                            fz={12}
                            editable={false}
                            onRemove={() => {
                              tasks.setState((s) => ({
                                ...s,
                                tagIds: s.tagIds?.filter((id) => id !== tag._id),
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
                      tasks.setState((s) => ({ ...s, tagIds: undefined }));
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
          icon={IconFlagFilled}
          label={t("priority")}
          autoHideLabel
          value={tasks.state.priority}
          options={Object.values(TaskPriority)
            .reverse()
            .map((priority) => ({
              value: priority,
              label: t(`task_priority_${priority}`),
              icon: IconFlagFilled,
              activeColor: getTaskPriorityColor(priority),
            }))}
          onChange={(value) => tasks.setState((s) => ({ ...s, priority: value as TaskPriority }))}
          onClear={() => tasks.setState((s) => ({ ...s, priority: undefined }))}
        />

        <ButtonSelect
          icon={IconCircleCheck}
          label={tasks.state.showClosed ? t("hide_closed") : t("show_closed")}
          isActive={tasks.state.showClosed}
          iconStrokeWidth={1.8}
          onClick={() => {
            tasks.setState((s) => ({ ...s, showClosed: tasks.state.showClosed ? undefined : true }));
          }}
        />
      </Group>

      <Group>
        <Renderer visible={isAbleToUndo || isAbleToRedo}>
          <Card bg="transparent" radius={100} p={0} withBorder style={{ borderColor: color("gray.5") }}>
            <Group gap={0}>
              <Tooltip label={t("undo")}>
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

              <Tooltip label={t("redo")}>
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
