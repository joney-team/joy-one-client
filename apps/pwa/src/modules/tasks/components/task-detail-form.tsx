"use client";

import { Avatar } from "@/components/avatar";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { Hovered } from "@/components/hovered";
import { formatDuration } from "@/components/inputs/estimate-time-input/estimate-time-input-utils";
import { TimeTrackingsInput } from "@/components/inputs/time-trackings-input";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { DefaultTaskStatusId, TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback, useHover } from "@mantine/hooks";
import {
  Icon,
  IconCalendar,
  IconCaretRightFilled,
  IconCheck,
  IconFiles,
  IconFlag,
  IconFlagFilled,
  IconHourglassHigh,
  IconPlaystationCircle,
  IconPlus,
  IconStopwatch,
  IconTags,
  IconUser,
  IconUserSquareRounded,
  IconX,
} from "@tabler/icons-react";
import { FC, PropsWithChildren, ReactNode, useMemo, useRef } from "react";
import { FilesBox } from "../../files/files-box";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import { useTaskStatuses } from "../hooks/use-task-statuses";
import { useUpdateTasks } from "../hooks/use-update-tasks";
import { useTaskMenu } from "../modules/task-menu/task-menu";
import { TaskMenuAction } from "../modules/task-menu/task-menu-types";
import { taskPriorities } from "../task-constants";
import { TaskTimeline } from "./task-timeline";

export interface TaskDetailFormProps {
  task: TaskDataFragment;
  onClose?: () => void;
}

const FormField: FC<
  PropsWithChildren<{
    label: ReactNode;
    icon: Icon;
    iconColor?: string;
    onClick: (contentRef: HTMLDivElement) => void;
    onRemove?: () => void;
    placeholder?: ReactNode;
    value?: ReactNode;
  }>
> = ({ label, icon: Icon, iconColor, onClick, onRemove, placeholder, value, children }) => {
  const hover = useHover();
  const color = useColor();
  const contentRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (value) {
      return (
        <Group px={8} gap={5} align="center">
          {value}
        </Group>
      );
    }

    if (placeholder) {
      return (
        <Group px={8} gap={5} align="center">
          <IconPlus size={13} color={color("gray")} />

          <Text c="gray" fz={13}>
            {placeholder}
          </Text>
        </Group>
      );
    }

    return children;
  }, [value, placeholder]);

  return (
    <Group
      flex={1}
      w="100%"
      gap={0}
      className="clickable"
      onClick={() => {
        if (!contentRef.current) return;
        onClick(contentRef.current);
      }}
    >
      <Group gap={5} w={140}>
        <ThemeIcon variant="transparent" color={color(iconColor || "gray")} size="sm">
          <Icon strokeWidth={1.5} />
        </ThemeIcon>

        <Text c="var(--mantine-color-text)" fz={13}>
          {label}
        </Text>
      </Group>

      <Group flex={1} p={0} ref={contentRef}>
        <Group
          flex={1}
          gap={5}
          w="100%"
          ref={hover.ref}
          className="unselectable"
          bg={hover.hovered ? "var(--mantine-color-default-hover)" : "transparent"}
          mih={36}
          style={{
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <Group flex={1} miw={0} gap={5} ref={contentRef}>
            {content}
          </Group>

          {!!onRemove && !!value && (
            <Group px={8} opacity={hover.hovered ? 1 : 0} align="center">
              <ActionIcon
                variant="subtle"
                color="gray.5"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove?.();
                }}
              >
                <IconX size={16} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Group>
    </Group>
  );
};

export const TaskDetailForm: FC<TaskDetailFormProps> = ({ task }) => {
  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();

  const onValuesChange = useDebouncedCallback(
    async (values: Pick<TaskDataFragment, "name" | "description">) => {
      if (!values.name) return;

      const isDiff = JSON.stringify(task) !== JSON.stringify(values);
      if (!isDiff) return;

      await updateTasks({
        _id: task._id,
        name: values.name,
        description: values.description,
      });

      emitInternalEvent(InternalEvent.REFETCH_TASKS);
    },
    500
  );

  const form = useForm<Pick<TaskDataFragment, "name" | "description">>({
    initialValues: {
      name: task.name,
      description: task.description ?? "",
    },
    onValuesChange: (val) => onValuesChange(val),
  });

  const { status, statuses } = useTaskStatuses(task);

  const currentStatusIndex = statuses.findIndex((v) => v.id === task.status);
  const nextStatus = statuses[currentStatusIndex + 1];
  const completedStatus = statuses.find((v) => v.id === DefaultTaskStatusId.CLOSED);

  const taskMenu = useTaskMenu({
    task,
    groupVariables: null,
  });

  return (
    <Stack gap={30}>
      <Stack pt={12}>
        <ContentEditable
          fz={25}
          fw={500}
          placeholder={t`Enter task name`}
          value={form.values.name}
          onChange={(value) => form.setFieldValue("name", value)}
        />

        <SimpleGrid cols={{ md: 2 }} spacing={3} maw="100%" w={900}>
          {status && (
            <FormField
              icon={IconPlaystationCircle}
              key={status.id}
              label={<Trans>Status</Trans>}
              onClick={(e) =>
                taskMenu.open({
                  action: TaskMenuAction.CHANGE_STATUS,
                  target: e,
                  offset: { x: 10 },
                })
              }
            >
              <Group px={8} gap={5}>
                <Group
                  gap={0}
                  bg={status.color ?? "gray"}
                  wrap="nowrap"
                  component="button"
                  style={{
                    padding: 0,
                    cursor: "pointer",
                    outline: "none",
                    border: "none",
                    borderRadius: 5,
                  }}
                >
                  <Group
                    px={8}
                    align="center"
                    justify="center"
                    style={{
                      borderRight: `1px solid #00000020`,
                    }}
                  >
                    <Text c="white" fz={13} fw={500} tt="uppercase">
                      {status.name}
                    </Text>
                  </Group>

                  {nextStatus && (
                    <Tooltip label={`${t`Next status`} ${nextStatus.name}`}>
                      <ActionIcon
                        size={24}
                        radius={5}
                        component="div"
                        color="white"
                        variant="transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          form.setFieldValue("status", nextStatus.id);
                        }}
                      >
                        <IconCaretRightFilled size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>

                {task.status !== completedStatus?.id && (
                  <Hovered>
                    {({ hovered, ref }) => (
                      <Tooltip label={t`Task complete`}>
                        <ActionIcon
                          ref={ref}
                          size={24}
                          radius={5}
                          color={hovered ? completedStatus?.color ?? "gray" : "gray"}
                          variant={hovered ? "filled" : "light"}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await updateTasks({
                              _id: task._id,
                              status: DefaultTaskStatusId.CLOSED,
                            });
                          }}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Hovered>
                )}
              </Group>
            </FormField>
          )}

          <FormField
            icon={IconUser}
            label={<Trans>Assignee</Trans>}
            placeholder={<Trans>Add assignee</Trans>}
            value={
              task.assigneeUsers.length > 0
                ? task.assigneeUsers?.map((member) => (
                    <Avatar key={member._id} size={26} user={member} hideOnlineStatus />
                  ))
                : null
            }
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_ASSIGNEE,
                target: e,
                offset: { x: 10 },
              })
            }
            onRemove={() =>
              updateTasks({
                _id: task._id,
                assigneeUsers: [],
              })
            }
          />

          <FormField
            label={<Trans>Priority</Trans>}
            placeholder={<Trans>Add priority</Trans>}
            icon={task.priority ? IconFlagFilled : IconFlag}
            iconColor={
              task.priority ? taskPriorities[task.priority as TaskPriority]?.color : "gray"
            }
            onRemove={() =>
              updateTasks({
                _id: task._id,
                priority: null,
              })
            }
            value={
              task.priority ? taskPriorities[task.priority as TaskPriority]?.label() : undefined
            }
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_PRIORITY,
                target: e,
                offset: { x: 10 },
              })
            }
          />

          <FormField
            label={<Trans>Due date</Trans>}
            placeholder={<Trans>Add due date</Trans>}
            icon={IconCalendar}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                dueDate: null,
                startDate: null,
              })
            }
            value={task.dueDate || task.startDate ? <TaskTimeline task={task} /> : null}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_TIMELINE,
                target: e,
                offset: { x: 10 },
              })
            }
          />

          <FormField
            icon={IconStopwatch}
            label={<Trans>Time trackings</Trans>}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                timeTrackings: [],
              })
            }
            onClick={() => {}}
          >
            <TimeTrackingsInput
              p={5}
              flex={1}
              value={task.timeTrackings as any}
              onChange={(timeTrackings) =>
                updateTasks({
                  _id: task._id,
                  timeTrackings: timeTrackings as any,
                })
              }
            />
          </FormField>

          <FormField
            icon={IconHourglassHigh}
            label={<Trans>Estimate time</Trans>}
            placeholder={<Trans>Add estimate time</Trans>}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                estimatedTime: null,
              })
            }
            value={task.estimatedTime ? formatDuration(task.estimatedTime) : null}
            onClick={(e) => {
              taskMenu.open({ action: TaskMenuAction.CHANGE_ESTIMATE_TIME, target: e });
            }}
          />

          <FormField
            label={<Trans>Customer</Trans>}
            placeholder={<Trans>Add customer</Trans>}
            icon={IconUserSquareRounded}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                customer: null,
              })
            }
            value={task.customer ? task.customer.name : null}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_CUSTOMER,
                target: e,
                offset: { x: 10 },
              })
            }
          />

          <FormField
            icon={IconTags}
            label={<Trans>Tags</Trans>}
            placeholder={<Trans>Add tags</Trans>}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_TAGS,
                target: e,
                offset: { x: 10 },
              })
            }
            onRemove={() =>
              updateTasks({
                _id: task._id,
                tags: [],
              })
            }
            value={
              task.tags && task.tags.length > 0
                ? task.tags?.map((tag) => (
                    <Badge key={tag._id} color={tag.color || "gray"} size="sm" variant="light">
                      {tag.name}
                    </Badge>
                  ))
                : null
            }
          />
        </SimpleGrid>

        <Editor
          value={form.values.description}
          onChangeHTML={(v) => {
            form.setFieldValue("description", v ?? "");
          }}
          delay={300}
          placeholder={t`Task description`}
          uploadFileOptions={{
            maxWidthOrHeight: 1500,
            refs: [`${AppEntity.TASKS}:${task._id}`],
          }}
        />
      </Stack>

      <Stack gap={8}>
        <Group gap={8}>
          <ThemeIcon variant="light" color="dark">
            <IconFiles strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fw={500}>
            <Trans>Attachments</Trans>
          </Text>
        </Group>

        <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${task._id}`]} />
      </Stack>
    </Stack>
  );
};
