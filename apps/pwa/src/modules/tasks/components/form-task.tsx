"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { Hovered } from "@/components/hovered";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { EstimateTimeInput } from "@/components/inputs/estimate-time-input";
import { TimeTrackingsInput } from "@/components/inputs/time-trackings-input";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { PartnersInput } from "@/modules/partners/components/partners-input";
import { TagsInput } from "@/modules/tags/components/tags-input";
import { TagType } from "@/modules/tags/tags-types";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { TaskStatusSelector } from "@/modules/tasks/components/task-status-selector";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { getTaskProgress, getTasks, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskPriority } from "@/modules/tasks/tasks-types";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Divider,
  em,
  Group,
  Menu,
  Progress,
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
  IconSubtask,
  IconTags,
  IconTopologyStar3,
  IconUser,
  IconUserSquareRounded,
  IconX,
} from "@tabler/icons-react";
import { FC, PropsWithChildren, ReactNode, useState } from "react";
import { CustomerInput } from "../../customers/components/customer-input";
import { FilesBox } from "../../files/files-box";
import { useUpdateTasks } from "../hooks/use-update-tasks";
import { TaskDataFragment } from "../queries/fragmentTask.graphql";
import CREATE_TASK_MUTATION, {
  type CreateTaskMutation,
  type CreateTaskMutationVariables,
} from "../queries/mutationCreateTask.graphql";
import QUERY_TASKS from "../queries/queryTasks.graphql";
import { taskPriorities } from "../task-constants";
import { TasksDndProvider } from "../tasks-dnd-provider";
import { ListTaskRowHead } from "../views/list/list-task-row-head";

export interface TaskFormProps {
  task?: TaskDataFragment;
  initial?: Partial<TaskDataFragment>;
  onClose?: () => void;
}

const formFieldHeight = 36;

export const TaskForm: FC<TaskFormProps> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const uploadFile = useUploadFile();

  const id = props.task?._id || "new_task_id";

  const { updateTasks } = useUpdateTasks();

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  const onUpdate = useDebouncedCallback((values: any) => {
    if (!props.task || !values.name) return;
    const isDiff = JSON.stringify(props.task) !== JSON.stringify(values);
    if (!isDiff) return;

    updateTasks([
      {
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
      },
    ]);
  }, 500);

  const initialTask: Partial<TaskDataFragment> = {
    status: DefaultTaskStatusId.TODO,
    ...props.initial,
  };

  const form = useForm({
    initialValues: Object.assign(initialTask, props.task),
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
        refetchQueries: [QUERY_TASKS],
      });

      if (!newTask) throw new Error(t`Failed to create task`);

      await Promise.all(
        rawFiles.map(async (file) =>
          uploadFile(file, { refs: [`${AppEntity.TASKS}:${newTask.createTask._id}`] }).catch(
            onError
          )
        )
      );

      props.onClose?.();
    } catch (error) {
      onError(error);
    }
  });

  const isOutdated =
    form.values.dueDate &&
    form.values.dueDate < DateTime.toSeconds(new Date()) &&
    props.task &&
    props.task.status !== DefaultTaskStatusId.CLOSED;

  const subTaskList = useList({
    id: `sub-tasks-${id}`,
    fetch: (q) =>
      getTasks({
        ...q,
        parentId: id,
        getAll: true,
      }),
  });

  useEventsListener(
    EventType.TASK_STATUS_UPDATED,
    (e) => {
      if (props.task && props.task._id === e.ref && e.data?.toStatus) {
        form.setFieldValue("status", e.data.toStatus);
      }
    },
    [props.task?._id]
  );

  useEventsListener(
    [EventType.TASK_ARCHIVED, EventType.TASKS_UPDATED, EventType.TASK_NEW],
    () => {
      if (props.task?._id) {
        subTaskList.fetch(true, { isSilient: true });
      }
    },
    [props.task?._id]
  );

  const statuses = workspace.settings.taskStatuses;

  const subTasks = subTaskList.data
    .filter((t) => t.parentId && t.parentId === props.task?._id)
    .sort((a, b) => a.order - b.order);

  const progress = getTaskProgress(subTasks, statuses);

  const currentStatusIndex = statuses.findIndex((v) => v.id === props.task?.status);
  const nextStatus = statuses[currentStatusIndex + 1];

  return (
    <form onSubmit={onCreate}>
      <Stack pt={10} gap={30}>
        <Stack>
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
            <FormFieldWrapper icon={IconPlaystationCircle} label={<Trans>Status</Trans>}>
              <TaskStatusSelector
                inputProps={{ flex: 1 }}
                onSelect={(status) => form.setFieldValue("status", status.id)}
                render={(ctx) => {
                  const statusStyled = renderTaskStatusStyle(
                    form.values.status,
                    workspace.settings.taskStatuses
                  );
                  const closedStatusStyled = renderTaskStatusStyle(
                    DefaultTaskStatusId.CLOSED,
                    workspace.settings.taskStatuses
                  );

                  return (
                    <FormField onClick={ctx.toggle}>
                      <Group gap={5} px={8} wrap="nowrap">
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
                  );
                }}
              />
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconUser} label={<Trans>Assignee</Trans>}>
              <FormField
                canRemove={(form.values.assigneeUsers?.length || 0) > 0}
                onRemove={() => form.setFieldValue("assigneeUsers", [])}
              >
                <WorkspaceMembersInput
                  w="100%"
                  collapsed
                  flex={1}
                  p={5}
                  value={form.values.assigneeUsers}
                  onChange={(users) => form.setFieldValue("assigneeUsers", users as any)}
                  style={{ cursor: "pointer" }}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconFlag} label={<Trans>Priority</Trans>}>
              <FormField
                canRemove={!!form.values.priority}
                onRemove={() => form.setFieldValue("priority", null)}
              >
                <TaskPrioritySelector
                  inputProps={{ flex: 1 }}
                  onSelect={(priority) => form.setFieldValue("priority", priority)}
                  render={(ctx) => {
                    return (
                      <Group
                        style={{ cursor: "pointer" }}
                        flex={1}
                        h={formFieldHeight}
                        p={5}
                        onClick={ctx.toggle}
                      >
                        {(function () {
                          if (form.values.priority) {
                            return (
                              <Group gap={1}>
                                <ThemeIcon
                                  color={
                                    taskPriorities[form.values.priority as TaskPriority]?.color
                                  }
                                  variant="transparent"
                                >
                                  <IconFlagFilled size={20} />
                                </ThemeIcon>
                                <Text>
                                  {taskPriorities[form.values.priority as TaskPriority]?.label()}
                                </Text>
                              </Group>
                            );
                          }

                          return (
                            <Text c="gray" fz={em(13)} px={3}>
                              <Trans>Add priority</Trans>
                            </Text>
                          );
                        })()}
                      </Group>
                    );
                  }}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconCalendar} label={<Trans>Due date</Trans>}>
              <FormField
                onRemove={() => form.setValues({ ...form.values, dueDate: null, startDate: null })}
                canRemove={!!form.values.dueDate || !!form.values.startDate}
              >
                <Menu>
                  <Menu.Target>
                    <Group style={{ cursor: "pointer", flex: 1 }} mih={formFieldHeight} p={5}>
                      {(function () {
                        if (form.values.dueDate && form.values.startDate) {
                          if (DateTime.isSame(form.values.dueDate, form.values.startDate, "day")) {
                            return (
                              <Group c={isOutdated ? "red" : "var(--mantine-color-text)"} gap={5}>
                                <Text>
                                  <DateFormat value={form.values.startDate} type="time" />
                                  {" - "}
                                  <DateFormat value={form.values.dueDate} type="date-time" />
                                </Text>
                              </Group>
                            );
                          }

                          return (
                            <Text c={isOutdated ? "red" : "var(--mantine-color-text)"}>
                              <DateFormat value={form.values.startDate} type="date-time" />
                              {" - "}
                              <DateFormat value={form.values.dueDate} type="date-time" />
                            </Text>
                          );
                        }

                        if (form.values.dueDate) {
                          return (
                            <Text c={isOutdated ? "red" : "var(--mantine-color-text)"}>
                              <DateFormat value={form.values.dueDate} type="date-time" />
                            </Text>
                          );
                        }

                        return (
                          <Text c="gray" fz={em(13)} px={3}>
                            <Trans>Add due date</Trans>
                          </Text>
                        );
                      })()}
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <DueDateInput
                      p={5}
                      startDate={form.values.startDate}
                      dueDate={form.values.dueDate}
                      onChange={(e) => {
                        form.setValues({ ...form.values, ...e });
                      }}
                    />
                  </Menu.Dropdown>
                </Menu>
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconStopwatch} label={<Trans>Time trackings</Trans>}>
              <FormField
                canRemove={!!form.values.timeTrackings?.length}
                onRemove={() => form.setFieldValue("timeTrackings", [])}
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
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconHourglassHigh} label={<Trans>Estimate time</Trans>}>
              <FormField
                canRemove={!!form.values.estimatedTime}
                onRemove={() => form.setFieldValue("estimatedTime", null)}
              >
                <EstimateTimeInput
                  p={5}
                  flex={1}
                  label={<Trans>Estimate time</Trans>}
                  {...form.getInputProps("estimatedTime")}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconUserSquareRounded} label={<Trans>Customer</Trans>}>
              <FormField
                canRemove={!!form.values.customer}
                onRemove={() => form.setFieldValue("customer", null)}
              >
                <CustomerInput
                  flex={1}
                  p={5}
                  value={form.values.customer as any}
                  onSelect={(customer) => form.setFieldValue("customer", customer as any)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconTopologyStar3} label={<Trans>Partners</Trans>}>
              <FormField
                canRemove={!!form.values.partners?.length}
                onRemove={() => form.setFieldValue("partners", [])}
              >
                <PartnersInput
                  flex={1}
                  p={5}
                  value={form.values.partners as any}
                  onChange={(partners) => form.setFieldValue("partners", partners as any)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconTags} label={<Trans>Tags</Trans>}>
              <FormField
                canRemove={!!form.values.tags?.length}
                onRemove={() => form.setFieldValue("tags", [])}
              >
                <TagsInput
                  flex={1}
                  type={TagType.TASK}
                  value={form.values.tags as any}
                  onChange={(tags) => form.setFieldValue("tags", tags as any)}
                />
              </FormField>
            </FormFieldWrapper>
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

        {/* {!!props.task && !props.task.parentId && (
          <Stack gap={5}>
            <Group justify="start">
              <Group gap={8}>
                <ThemeIcon variant="light" color="dark">
                  <IconSubtask strokeWidth={1.5} size={20} />
                </ThemeIcon>

                <Text fw={500}>
                  <Trans>Subtasks</Trans>
                </Text>
              </Group>

              <Group gap={5}>
                <Text fz={15}>
                  <NumberFormat value={progress.percent} suffix="%" />
                </Text>
                <Progress value={progress.percent} w={70} color={progress.status.color || "dark"} />
              </Group>

              <ModalCreateTask>
                {(open) => (
                  <Button
                    size="compact-xs"
                    color="gray.5"
                    variant="outline"
                    radius={100}
                    leftIcon={IconPlus}
                    onClick={() =>
                      open({
                        initial: {
                          parent: props.task,
                        },
                      })
                    }
                  >
                    <Trans>Subtasks</Trans>
                  </Button>
                )}
              </ModalCreateTask>
            </Group>

            {subTasks.length > 0 && (
              <TasksDndProvider>
                <Stack gap={5} mt={8}>
                  <Card withBorder shadow="none" p={0}>
                    <Stack gap={0}>
                      <Stack py={5}>
                        <ListTaskRowHead />
                      </Stack>

                      <Divider />

                      {subTasks.map((task, index) => {
                        return (
                          <ListTaskRow
                            key={task._id}
                            id={task._id}
                            showDivider={index < subTasks.length - 1}
                            limitName={20}
                            allowEditName={false}
                          />
                        );
                      })}
                    </Stack>
                  </Card>
                </Stack>
              </TasksDndProvider>
            )}
          </Stack>
        )} */}

        <Renderer visible={!!!props.task}>
          <Center>
            <Button
              loading={form.submitting}
              onClick={onCreate}
              leftIcon={IconCheck}
              type="submit"
              action
            >
              <Trans>Complete</Trans>
            </Button>
          </Center>
        </Renderer>
      </Stack>
    </form>
  );
};

const FormFieldWrapper: FC<
  PropsWithChildren<{
    label: ReactNode;
    icon: Icon;
  }>
> = (props) => {
  return (
    <Group flex={1} w="100%" gap={0} className="CtaWrapper">
      <Group gap={5} w={140}>
        <ThemeIcon variant="transparent" color="var(--mantine-color-text)" size="sm">
          <props.icon strokeWidth={1.5} />
        </ThemeIcon>
        <Text c="var(--mantine-color-text)" fz={em(13)}>
          {props.label}
        </Text>
      </Group>

      <Group flex={1} p={0}>
        {props.children}
      </Group>
    </Group>
  );
};

const FormField: FC<
  PropsWithChildren<{
    onClick?: () => void;
    onRemove?: () => void;
    canRemove?: boolean;
  }>
> = (props) => {
  const hover = useHover();

  return (
    <Group
      flex={1}
      w="100%"
      ref={hover.ref}
      className="unselectable"
      bg={hover.hovered ? "var(--mantine-color-default-hover)" : "transparent"}
      mih={formFieldHeight}
      style={{
        borderRadius: 10,
        cursor: props.onClick ? "pointer" : "default",
      }}
      onClick={props.onClick}
    >
      {props.children}

      <Renderer visible={!!props.onRemove && props.canRemove}>
        <Group px={8} opacity={hover.hovered ? 1 : 0}>
          <ActionIcon
            variant="subtle"
            color="gray.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.onRemove?.();
            }}
          >
            <IconX size={16} strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </Renderer>
    </Group>
  );
};
