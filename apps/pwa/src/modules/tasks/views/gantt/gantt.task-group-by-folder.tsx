"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Hovered } from "@/components/hovered";
import { formatDuration } from "@/components/inputs/estimate-time-input";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity } from "@/modules/tags/tags-types";
import { QuickCreateTaskInput } from "@/modules/tasks/components/quick-create-task-input";
import { onTasksUpdated } from "@/modules/tasks/hooks/use-task";
import { getTaskEntites, getTaskProgress } from "@/modules/tasks/tasks-service";
import { useColor } from "@/modules/theme/use-color";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { ActionIcon, alpha, Box, em, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import {
  IconFolder,
  IconFolderOpen,
  IconHourglassHigh,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { useTaskDrop } from "../../tasks-dnd-provider";
import { ganttConfig } from "./gantt.config";
import { useGantt } from "./gantt.context";
import { SidebarRowSticky } from "./gantt.layout";
import { GanttTaskRowBody } from "./gantt.task-row-body";
import { GanttTaskRowSidebar } from "./gantt.task-row-sidebar";
import { getRangeOfTasks } from "./gantt.utils";

interface GanttTaskGroupByFoldersProps {
  position: "sidebar" | "body";
}

export const GanttTaskGroupByFolders: FC<GanttTaskGroupByFoldersProps> = (props) => {
  const tasks = useGantt();

  if (tasks.activatedTagFolder) {
    return <GanttTaskGroupByFolder {...props} index={0} tagFolder={tasks.activatedTagFolder} />;
  }

  if (tasks.tagFolders.length === 0) {
    return <GanttTaskGroupByFolder {...props} index={0} pure />;
  }

  return (
    <Fragment>
      <GanttTaskGroupByFolder {...props} index={0} />

      {tasks.tagFolders.map((tagFolder, index) => (
        <GanttTaskGroupByFolder
          key={tagFolder._id}
          {...props}
          tagFolder={tagFolder}
          index={index + 1}
        />
      ))}
    </Fragment>
  );
};

interface GanttTaskGroupByFolderProps extends GanttTaskGroupByFoldersProps {
  tagFolder?: TagEntity;
  pure?: boolean;
  index?: number;
}

export const GanttTaskGroupByFolder: FC<GanttTaskGroupByFolderProps> = (props) => {
  const gantt = useGantt();
  const forceUpdate = useForceUpdate();
  const workspaceLayout = useWorkspaceLayout();

  const { tagFolder } = props;
  const color = useColor();

  const folderId = tagFolder?._id || "root";
  const folderState = gantt.foldersState[folderId];
  const folderName = tagFolder?.name || t`General tasks`;
  const folderColor = tagFolder?.color || color("primary");

  const isCollapsed = !!folderState?.isCollapsed;

  const folderTasks = gantt.tasks
    .filter((t) => (t.folderId || "root") === folderId)
    .sort((a, b) => a.order - b.order);

  const allFolderTasks = getTaskEntites()
    .filter((t) => (t.folderId || "root") === folderId)
    .sort((a, b) => a.order - b.order);

  const folderRootTasks = folderTasks.filter((v) => !v.parentId);

  onTasksUpdated(
    (updatedTasks) => {
      const relatedTasks = updatedTasks
        .filter((t) => (t.folderId || "root") === folderId)
        .sort((a, b) => a.order - b.order);

      if (relatedTasks.length > 0) {
        forceUpdate();
      }
    },
    [folderId]
  );

  if (props.position === "sidebar") {
    return (
      <Fragment>
        {/* Folder Infos */}
        {!props.pure && (
          <Hovered>
            {(hover) => {
              return (
                <Group
                  ref={hover.ref}
                  px={10}
                  gap={8}
                  style={{
                    borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
                    position: "relative",
                    minHeight: ganttConfig.rowHeight,
                    maxHeight: ganttConfig.rowHeight,
                  }}
                  miw={gantt.sidebarContentWidth}
                >
                  <ActionIcon
                    color={folderColor}
                    variant="light"
                    size="sm"
                    onClick={() => {
                      gantt.setFolderState(folderId, {
                        ...folderState,
                        isCollapsed: !isCollapsed,
                      });
                    }}
                  >
                    {isCollapsed ? <IconFolder size={16} /> : <IconFolderOpen size={16} />}
                  </ActionIcon>

                  <Text flex={1} fz={em(14)} fw={600}>
                    {folderName}
                  </Text>

                  <SidebarRowSticky>
                    {!!props.tagFolder && (
                      <Tooltip label={t`Update information`}>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          opacity={hover.hovered ? 1 : 0}
                          onClick={() =>
                            OnModalTagForm({ tag: props.tagFolder!, type: props.tagFolder!.type })
                          }
                        >
                          <IconPencil size={13} />
                        </ActionIcon>
                      </Tooltip>
                    )}

                    <Tooltip label={t`Add tasks`}>
                      <QuickCreateTaskInput folderId={props.tagFolder?._id}>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          opacity={hover.hovered ? 1 : 0}
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </QuickCreateTaskInput>
                    </Tooltip>
                  </SidebarRowSticky>
                </Group>
              );
            }}
          </Hovered>
        )}

        <ChangeTagFolderDrop
          folderId={props.tagFolder?._id}
          visible={allFolderTasks.length === 0}
        />

        {/* Tasks */}
        {!isCollapsed &&
          folderRootTasks.map((task, index) => {
            return (
              <GanttTaskRowSidebar
                key={task._id}
                id={task._id}
                indexType={
                  index === folderRootTasks.length - 1 ? "last" : index === 0 ? "first" : undefined
                }
                nextId={folderRootTasks[index + 1]?._id}
                prevId={folderRootTasks[index - 1]?._id}
              />
            );
          })}
      </Fragment>
    );
  }

  const rangeDate = getRangeOfTasks(allFolderTasks);
  const tasksProgress = getTaskProgress(allFolderTasks, gantt.statuses);
  const totalEstimatedTime = allFolderTasks.reduce(
    (acc, task) => acc + (task.estimatedTime || 0),
    0
  );

  return (
    <Fragment>
      {!props.pure && (
        <Group
          w="100%"
          miw="100%"
          style={{
            position: "relative",
            minHeight: ganttConfig.rowHeight,
            maxHeight: ganttConfig.rowHeight,
          }}
        >
          {(function () {
            if (rangeDate.dueDate && rangeDate.startDate && folderTasks.length > 0) {
              const startIndex = gantt.dates.findIndex(
                (v) => rangeDate.startDate && DateTime.isSame(v, rangeDate.startDate, "day")
              );
              const endIndex = gantt.dates.findIndex(
                (v) => rangeDate.dueDate && DateTime.isSame(v, rangeDate.dueDate, "day")
              );
              const left = startIndex * gantt.state.columnSize;

              const _width =
                startIndex === endIndex
                  ? gantt.state.columnSize
                  : (endIndex - startIndex + 1) * gantt.state.columnSize;

              const isStartToday =
                DateTime.isSame(rangeDate.startDate, new Date(), "day") && props.index === 0;

              return (
                <Box
                  w={_width}
                  bg={alpha(color(folderColor), 0.5)}
                  h="10px"
                  style={{
                    position: "absolute",
                    borderRadius: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    left,
                  }}
                >
                  <Text
                    fz={em(8)}
                    fw={700}
                    style={{
                      position: "absolute",
                      top: "-13px",
                      left: isStartToday ? 55 : 5,
                    }}
                    c={color(folderColor)}
                    w="max-content"
                  >
                    <NumberFormat
                      value={tasksProgress.percent}
                      suffix="%"
                      format={{ maximumFractionDigits: 2 }}
                    />{" "}
                    {folderName}
                  </Text>

                  <Box
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: 100,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      w={`${tasksProgress.percent}%`}
                      h="100%"
                      style={{ position: "absolute", top: 0, left: 0 }}
                      bg={color(folderColor)}
                    />
                  </Box>
                </Box>
              );
            }
          })()}

          <Group px={8} pos="sticky" top={0} left={0}>
            {totalEstimatedTime > 0 && !gantt.state.isHideEstimateTime && (
              <Group
                gap={0}
                bg={alpha(color(folderColor), 0.1)}
                px={3}
                style={{ borderRadius: 100 }}
              >
                <ThemeIcon variant="transparent" color="gray" size="xs">
                  <IconHourglassHigh size={11} />
                </ThemeIcon>

                <Text fz={11} c="gray" pr={5}>
                  {formatDuration(totalEstimatedTime)}
                </Text>
              </Group>
            )}
          </Group>
        </Group>
      )}

      {!isCollapsed &&
        folderRootTasks.map((task) => {
          return <GanttTaskRowBody key={task._id} id={task._id} />;
        })}
    </Fragment>
  );
};

export const ChangeTagFolderDrop: FC<{ folderId?: string; visible?: boolean }> = (props) => {
  const tags = useTags();
  const color = useColor();
  const tagFolder = tags.list.find((v) => v._id === props.folderId);

  const droppable = useTaskDrop(`${props.folderId}-tag-folder`, {
    folderId: props.folderId || "root",
  });

  if (!props.visible) return null;

  return (
    <Box
      ref={droppable.setNodeRef}
      bg={alpha(tagFolder?.color || color("primary"), 0.2)}
      w="100%"
      h={droppable.isOver ? ganttConfig.rowHeight : 10}
      mt={droppable.isOver ? 0 : -10}
      opacity={droppable.isOver ? 0.5 : 0}
      style={{ transition: "height 0.2s" }}
    />
  );
};
