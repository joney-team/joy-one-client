"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { Hovered } from "@/components/hovered";
import { formatDuration } from "@/components/inputs/estimate-time-input/estimate-time-input-utils";
import { TimeTrackingsInput } from "@/components/inputs/time-trackings-input";
import { Renderer } from "@/components/renderer";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Center,
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
import { FC, PropsWithChildren, ReactNode, useMemo, useRef, useState } from "react";
import { FilesBox } from "../../files/files-box";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import CREATE_TASK_MUTATION, {
  type CreateTaskMutation,
  type CreateTaskMutationVariables,
} from "../graphql/mutationCreateTask.graphql";
import { useUpdateTasks } from "../hooks/use-update-tasks";
import { useTaskMenu } from "../modules/task-menu/task-menu";
import { TaskMenuAction } from "../modules/task-menu/task-menu-types";
import { taskPriorities } from "../task-constants";
import { TaskTimeline } from "./task-timeline";

export interface TaskFormProps {
  task?: TaskDataFragment;
  initial?: Partial<TaskDataFragment>;
  onCreated?: (id: string) => void;
  onClose?: () => void;
}

const formFieldHeight = 36;

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
          mih={formFieldHeight}
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

export const TaskForm: FC<TaskFormProps> = (props) => {
  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();

  const workspace = useWorkspace();
  const uploadFile = useUploadFile();

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  const onUpdate = useDebouncedCallback(async (values: any) => {
    if (!props.task || !values.name) return;

    const isDiff = JSON.stringify(props.task) !== JSON.stringify(values);
    if (!isDiff) return;

    await updateTasks({
      _id: props.task._id,
      name: values.name,
      description: values.description,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate,
      startDate: values.startDate,
      customer: values.customer,
      assigneeUsers: values.assigneeUsers,
      partners: values.partners,
      tags: values.tags,
      estimatedTime: values.estimatedTime,
    });

    emitInternalEvent(InternalEvent.REFETCH_TASKS);
  }, 500);

  const initialTask: TaskDataFragment = useMemo(() => {
    return Object.assign(
      {
        _id: props.task?._id ?? "creation",
        status: DefaultTaskStatusId.TODO,
        assigneeUsers: [],
        tags: [],
        partners: [],
        timeTrackings: [],
        ...props.initial,
      },
      props.task
    );
  }, [props.task, props.initial]);

  const form = useForm({
    initialValues: initialTask,
    onValuesChange: (values) => {
      if (props.task) onUpdate(values);
    },
  });

  const [createTask] = useMutation<CreateTaskMutation, CreateTaskMutationVariables>(
    CREATE_TASK_MUTATION
  );

  const onCreate = form.onSubmit(async (values) => {
    if (!!props.task?._id) return;

    try {
      if (!values.name) throw Error(t`Task name is required`);

      const { data: newTask } = await createTask({
        variables: {
          input: {
            name: values.name,
            order: values.order,
            parentId: values.parent?._id,
            description: values.description,
            priority: values.priority,
            status: values.status,
            dueDate: values.dueDate,
            startDate: values.startDate,
            assigneeUserIds: values.assigneeUsers?.map((user) => user.userId),
            customerId: values.customer?._id,
            estimatedTime: values.estimatedTime,
            partnerIds: values.partners?.map((partner) => partner._id),
            tagIds: values.tags?.map((tag) => tag._id),
            timeTrackings: values.timeTrackings,
            folderId: values.folder?._id,
          },
        },
      });

      emitInternalEvent(InternalEvent.REFETCH_TASKS);

      if (!newTask) throw new Error(t`Failed to create task`);

      await Promise.all(
        rawFiles.map(async (file) =>
          uploadFile(file, { refs: [`${AppEntity.TASKS}:${newTask.createTask._id}`] }).catch(
            onError
          )
        )
      );

      props.onCreated?.(newTask.createTask._id);
      props.onClose?.();
    } catch (error) {
      onError(error);
    }
  });

  const statuses = workspace.settings.taskStatuses;
  const currentStatusIndex = statuses.findIndex((v) => v.id === props.task?.status);
  const nextStatus = statuses[currentStatusIndex + 1];

  const statusStyled = renderTaskStatusStyle(
    form.values.status ?? DefaultTaskStatusId.TODO,
    workspace.settings.taskStatuses
  );

  const closedStatusStyled = renderTaskStatusStyle(
    DefaultTaskStatusId.CLOSED,
    workspace.settings.taskStatuses
  );

  const taskMenu = useTaskMenu({
    task: form.values,
    groupVariables: null,
    updateTask: async (task) => {
      form.setValues({ ...form.getValues(), ...task });
    },
  });

  return (
    <form onSubmit={onCreate}>
      <Stack gap={30}>
        <Stack pt={12}>
          <ContentEditable
            fz={25}
            fw={500}
            autoFocus={!props.task}
            placeholder={t`Enter task name`}
            value={form.values.name}
            onChange={(value) => form.setFieldValue("name", value)}
            onEnter={!props.task ? () => onCreate() : undefined}
          />

          <SimpleGrid cols={{ md: 2 }} spacing={3} maw="100%" w={900}>
            <FormField
              icon={IconPlaystationCircle}
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
                  bg={statusStyled.color}
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
                    <Text c="white" fz={13} fw={500}>
                      {statusStyled.name}
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

                {props.task && form.values.status !== DefaultTaskStatusId.CLOSED && (
                  <Hovered>
                    {({ hovered, ref }) => (
                      <Tooltip label={t`Task complete`}>
                        <ActionIcon
                          ref={ref}
                          size={24}
                          radius={5}
                          color={hovered ? closedStatusStyled.color : "gray"}
                          variant={hovered ? "filled" : "light"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.setFieldValue("status", DefaultTaskStatusId.CLOSED);
                          }}
                        >
                          <closedStatusStyled.icon size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Hovered>
                )}
              </Group>
            </FormField>

            <FormField
              icon={IconUser}
              label={<Trans>Assignee</Trans>}
              placeholder={<Trans>Add assignee</Trans>}
              value={
                form.values.assigneeUsers.length > 0
                  ? form.values.assigneeUsers?.map((member) => (
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
              onRemove={() => form.setFieldValue("assigneeUsers", [])}
            />

            <FormField
              label={<Trans>Priority</Trans>}
              placeholder={<Trans>Add priority</Trans>}
              icon={form.values.priority ? IconFlagFilled : IconFlag}
              iconColor={
                form.values.priority
                  ? taskPriorities[form.values.priority as TaskPriority]?.color
                  : "gray"
              }
              onRemove={() => form.setFieldValue("priority", null)}
              value={
                form.values.priority
                  ? taskPriorities[form.values.priority as TaskPriority]?.label()
                  : undefined
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
              onRemove={() => form.setValues({ ...form.values, dueDate: null, startDate: null })}
              value={
                form.values.dueDate || form.values.startDate ? (
                  <TaskTimeline task={form.values} />
                ) : null
              }
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
              onRemove={() => form.setFieldValue("timeTrackings", [])}
              onClick={() => {}}
            >
              <TimeTrackingsInput
                p={5}
                flex={1}
                value={form.values.timeTrackings as any}
                onChange={(timeTrackings) =>
                  form.setFieldValue("timeTrackings", timeTrackings as any)
                }
              />
            </FormField>

            <FormField
              icon={IconHourglassHigh}
              label={<Trans>Estimate time</Trans>}
              placeholder={<Trans>Add estimate time</Trans>}
              onRemove={() => form.setFieldValue("estimatedTime", null)}
              value={form.values.estimatedTime ? formatDuration(form.values.estimatedTime) : null}
              onClick={(e) => {
                taskMenu.open({ action: TaskMenuAction.CHANGE_ESTIMATE_TIME, target: e });
              }}
            />

            <FormField
              label={<Trans>Customer</Trans>}
              placeholder={<Trans>Add customer</Trans>}
              icon={IconUserSquareRounded}
              onRemove={() => form.setFieldValue("customer", null)}
              value={form.values.customer ? form.values.customer.name : null}
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
              onRemove={() => form.setFieldValue("tags", [])}
              value={
                form.values.tags && form.values.tags.length > 0
                  ? form.values.tags?.map((tag) => (
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
            onChangeHTML={(v) => form.setFieldValue("description", v as any)}
            delay={300}
            placeholder={t`Task description`}
            uploadFileOptions={{
              maxWidthOrHeight: 1500,
              refs: [`${AppEntity.TASKS}:${props.task?._id}`],
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

          {props.task ? (
            <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${props.task._id}`]} />
          ) : (
            <FilesBox rawFiles={rawFiles} onChangeRawFiles={(files) => setRawFiles(files)} />
          )}
        </Stack>

        <Renderer visible={!!!props.task}>
          <Center>
            <Button loading={form.submitting} leftIcon={IconCheck} type="submit" action>
              <Trans>Complete</Trans>
            </Button>
          </Center>
        </Renderer>
      </Stack>
    </form>
  );
};
