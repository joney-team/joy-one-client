"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { Renderer } from "@/components/renderer";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { TaskPriority } from "@/modules/tasks/tasks-types";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Group,
  Portal,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCalendar,
  IconCornerDownRight,
  IconFlag,
  IconFlagFilled,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconSquareCheckFilled,
  IconSquareDashed,
  IconSubtask,
  IconTagPlus,
} from "@tabler/icons-react";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { taskPriorities } from "../../task-constants";

import { Button } from "@/components/buttons/button";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import Link from "next/link";
import { TasksQuery, TasksQueryVariables } from "../../queries/queryTasks.graphql";
import { isTaskOutdated } from "../../tasks-service";

import { useColor } from "@/modules/theme/use-color";
import { classNames } from "@/utils/ui.utils";
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { motion } from "framer-motion";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";
import { useTaskSelections } from "../../modules/task-selections/task-selections-context";
import styles from "./list-tasks.module.css";

type Task = TasksQuery["tasks"]["data"][number];

const TaskSelection: FC<{
  task: Task;
  variables?: TasksQueryVariables;
}> = ({ task, variables }) => {
  const color = useColor();
  const { selected, toggleSelect } = useTaskSelections();
  const isSelected = selected.some((v) => v._id === task._id);

  return (
    <ActionIcon
      color={isSelected ? color("primary") : "gray"}
      variant="subtle"
      onClick={(e) => toggleSelect({ task, isShiftKey: e.shiftKey, variables })}
    >
      {isSelected ? (
        <IconSquareCheckFilled size={18} />
      ) : (
        <IconSquareDashed strokeWidth={1.5} size={18} />
      )}
    </ActionIcon>
  );
};

export const ListTaskRow: FC<{
  task: Task;
  prevTask?: Task | null;
  nextTask?: Task | null;
  href: string;
  allowEditName?: boolean;
  lastRow?: boolean;
  groupVariables?: TasksQueryVariables;
  isMarkAsChild?: boolean;
  droppableOptions?: {
    inherits?: (keyof Task)[];
  };
}> = ({
  task,
  allowEditName = true,
  href,
  groupVariables,
  lastRow = false,
  prevTask,
  nextTask,
  isMarkAsChild = false,
  droppableOptions = {},
}) => {
  const droppableRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const { updateTasks } = useUpdateTasks();

  const [isEditName, setIsEditName] = useState(false);
  const [over, setOver] = useState<{ edge: Edge; rect: DOMRect } | null>(null);

  const onChangeName = useDebouncedCallback((name: string) => {
    if (!task._id || !name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  useEffect(() => {
    if (!draggingRef.current || !droppableRef.current) return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData: ({ element }) => ({
          task,
          groupVariables,
          rect: element.getBoundingClientRect(),
        }),
        onDrop() {
          setIsDragging(false);
        },
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: () => ({ x: 24, y: 24 }),
            render: ({ container }) => {
              draggingRefContainer.current = container;
              setIsDragging(true);
            },
          });
        },
      }),
      dropTargetForElements({
        element: droppableRef.current,
        getData: ({ element, input }) => {
          return attachClosestEdge(
            { task, groupVariables },
            { element, input, allowedEdges: ["top", "bottom"] }
          );
        },
        onDragEnter({ source, self }) {
          const sourceTask = source.data.task as Task;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver({ edge: closestEdge, rect: source.data.rect as DOMRect });
        },
        onDragLeave({ source }) {
          const sourceTask = source.data.task as Task;
          if (!sourceTask) return;
          if (sourceTask._id === task._id) return;

          setOver(null);
        },
        onDrag({ source, self }) {
          const sourceTask = source.data.task as Task;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver((s) => {
            if (s?.edge === closestEdge) return s;
            return { edge: closestEdge, rect: source.data.rect as DOMRect };
          });
        },
        onDrop({ source, self }) {
          setOver(null);

          const sourceTask = source.data.task as Task;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          const inherits =
            droppableOptions.inherits?.reduce<Partial<Task>>(
              (acc, key) => ({
                ...acc,
                [key]: task[key],
              }),
              {}
            ) ?? {};

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (closestEdge === "top") {
            const order = (task.order + (prevTask?.order ?? 0)) / 2;
            updateTasks([
              {
                _id: sourceTask._id,
                order,
                ...inherits,
                context,
              },
            ]);
          }

          if (closestEdge === "bottom") {
            const order = (task.order + (nextTask?.order ?? 0.5)) / 2;
            updateTasks([
              {
                _id: sourceTask._id,
                order,
                ...inherits,
                context,
              },
            ]);
          }
        },
      })
    );
  }, [task, groupVariables]);

  const droppableShadow = useMemo(() => {
    if (!over) return null;

    return (
      <motion.div
        style={{
          height: 38,
          width: "100%",
          background: "var(--mantine-color-gray-outline-hover)",
        }}
        animate={{ height: 44, transition: { duration: 0.2 } }}
      />
    );
  }, [over]);

  const isOutdated = isTaskOutdated(task);
  const toggleSubTasks = () => {
    // TODO: Toggle subtasks
    // setIsSubTasksVisible((s) => !s)
  };
  const indexSpacing = isMarkAsChild ? 16 : 0;

  return (
    <Fragment>
      <Stack gap={0} className={styles.ListTaskRowContainer} ref={droppableRef}>
        {over && over.edge === "top" && droppableShadow}

        <Group
          wrap="nowrap"
          gap={0}
          miw={0}
          h={44}
          w="100%"
          opacity={isDragging ? 0.5 : 1}
          style={{
            position: "relative",
          }}
          className={classNames(styles.ListTaskRow, {
            [styles.isLastRow]: lastRow,
          })}
        >
          <ActionIcon
            ref={draggingRef}
            component="div"
            variant="transparent"
            color="gray"
            style={{ cursor: "move", outline: "none" }}
          >
            <IconGripVertical size={16} strokeWidth={1.2} />
          </ActionIcon>

          <TaskSelection task={task} variables={groupVariables} />

          <Group pl={indexSpacing} flex={1} py={5} gap={5} wrap="nowrap" miw={0}>
            <Renderer visible={isMarkAsChild}>
              <ThemeIcon size="xs" color="gray" variant="transparent">
                <IconCornerDownRight strokeWidth={1.5} />
              </ThemeIcon>
            </Renderer>

            <TaskStatusOptions
              task={task}
              onSelect={(s) => updateTasks({ _id: task._id, status: s })}
            />

            <Group
              flex={1}
              gap={10}
              id="pointed"
              style={{
                cursor: isEditName ? "text" : "pointer",
                position: "relative",
              }}
              wrap="nowrap"
              miw={0}
            >
              <Group flex={1} gap={5} wrap="nowrap" style={{ overflow: "hidden" }}>
                {isEditName ? (
                  <ContentEditable
                    fz={14}
                    fw={500}
                    autoFocus
                    value={task.name}
                    onChange={onChangeName}
                    onEnter={() => setIsEditName(false)}
                    onBlur={() => setIsEditName(false)}
                  />
                ) : (
                  <Text
                    component={Link}
                    href={href}
                    fz={14}
                    fw={500}
                    truncate
                    style={{ outline: "none" }}
                  >
                    {task.name}
                  </Text>
                )}

                {task.tags.length > 0 && (
                  <Group gap={3} wrap="nowrap">
                    {task.tags.map((tag) => (
                      <TaskTag
                        key={tag._id}
                        id={tag._id}
                        h={22}
                        px={8}
                        fz={10}
                        onRemove={() => {
                          updateTasks({
                            _id: task._id,
                            tags: task.tags.filter((v) => v._id !== tag._id),
                          });
                        }}
                      />
                    ))}
                  </Group>
                )}

                {task.childCount > 0 && (
                  <Group gap={3} wrap="nowrap">
                    <Button
                      size="compact-xs"
                      color="gray.8"
                      variant="subtle"
                      leftIcon={IconSubtask}
                      fw={500}
                      onClick={toggleSubTasks}
                    >
                      <NumberFormat value={task.childCount} />
                    </Button>

                    {task.progress && (
                      <Group flex={1} justify="end" gap={5}>
                        <Text fz={10}>
                          <NumberFormat value={task.progress} suffix="%" />
                        </Text>
                        <Progress value={task.progress} w={60} color={"dark"} />
                      </Group>
                    )}
                  </Group>
                )}
              </Group>

              <Group gap={2} wrap="nowrap" pl={35} className={styles.HoverToActive}>
                {!task.parentId && (
                  <ModalCreateTask>
                    {(open) => (
                      <Tooltip label={<Trans>Create subtask</Trans>}>
                        <ActionIcon
                          variant="subtle"
                          color="gray.6"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            open({ initial: { parent: task } });
                          }}
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </ModalCreateTask>
                )}

                {allowEditName && (
                  <Tooltip label={<Trans>Edit task name</Trans>}>
                    <ActionIcon
                      variant="subtle"
                      color="gray.6"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditName(true);
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}

                <TagSelector
                  type={TagType.TASK}
                  onSelect={(tag) => {
                    if (!tag) return;
                    updateTasks({
                      _id: task._id,
                      tags: [...(task.tags.filter((v) => v._id !== tag._id) || []), tag as any],
                    });
                  }}
                  target={(selector) => {
                    return (
                      <Tooltip label={<Trans>Add tags</Trans>}>
                        <ActionIcon
                          variant="subtle"
                          color="gray.6"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selector.toggle();
                          }}
                        >
                          <IconTagPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    );
                  }}
                />
              </Group>
            </Group>

            <Group w={150} px={10}>
              <WorkspaceMembersInput
                collapsed
                value={task.assigneeUsers}
                onChange={(users) =>
                  updateTasks({
                    _id: task._id,
                    assigneeUsers: users as any,
                  })
                }
              />
            </Group>

            <Group w={200} px={10}>
              <CustomerInput
                value={task.customer}
                onSelect={(customer) =>
                  updateTasks([
                    {
                      _id: task._id,
                      customer: (customer ?? null) as any,
                    },
                  ])
                }
                clearable
              />
            </Group>

            <Group w={150} px={10} style={{ overflow: "hidden" }}>
              <ButtonSelect
                inactiveColor="gray.4"
                size={32}
                icon={IconCalendar}
                label={task.dueDate ? <DateFormat value={task.dueDate} type="date" /> : ""}
                activeColor={isOutdated ? "red" : "blue"}
                isActive={!!task.dueDate}
                dropdown={() => (
                  <DueDateInput
                    p={5}
                    startDate={task.startDate}
                    dueDate={task.dueDate}
                    onChange={(e) => {
                      updateTasks([{ _id: task._id, ...e }]);
                    }}
                  />
                )}
                onClear={() => updateTasks([{ _id: task._id, dueDate: null, startDate: null }])}
              />
            </Group>

            <Group w={70} px={10} justify="center" style={{ overflow: "hidden" }}>
              <ButtonSelect
                inactiveColor="gray.4"
                size={32}
                icon={task.priority ? IconFlagFilled : IconFlag}
                value={task.priority}
                isActive={!!task.priority}
                hideOptionLabel
                options={Object.values(TaskPriority)
                  .reverse()
                  .map((priority) => ({
                    value: priority,
                    label: taskPriorities[priority].label(),
                    icon: IconFlagFilled,
                    activeColor: taskPriorities[priority].color,
                  }))}
                onChange={(value) => {
                  updateTasks([{ _id: task._id, priority: value as any }]);
                }}
                onClear={() => updateTasks([{ _id: task._id, priority: null }])}
              />
            </Group>
          </Group>
        </Group>

        {over && over.edge === "bottom" && droppableShadow}
      </Stack>

      {isDragging && draggingRefContainer.current && (
        <Portal target={draggingRefContainer.current}>
          <Card shadow="xs" py={0} px={15} h={44} miw={300}>
            <Group align="center" h="100%">
              <Text fz={16} fw={500} lineClamp={2}>
                {task.name}
              </Text>
            </Group>
          </Card>
        </Portal>
      )}
    </Fragment>
  );
};
