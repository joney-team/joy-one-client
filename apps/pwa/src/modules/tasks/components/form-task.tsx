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
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { PartnersInput } from "@/modules/partners/components/partners-input";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { TagsInput } from "@/modules/tags/components/tags-input";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { TaskStatusSelector } from "@/modules/tasks/components/task-status-selector";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import {
  createTask,
  getTaskProgress,
  getTasks,
  renderTaskStatusStyle,
  updateTasks,
} from "@/modules/tasks/tasks-service";
import {
  DefaultTaskStatusId,
  TaskEntity,
  TaskPriority,
  TaskTimeTracking,
} from "@/modules/tasks/tasks-types";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback, useForceUpdate, useHover } from "@mantine/hooks";
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
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { CustomerInput } from "../../customers/components/customer-input";
import { FilesBox } from "../../files/files-box";
import { useTaskFolders } from "../hooks/use-task-folders";
import { taskPriorities } from "../task-constants";
import { TasksDndProvider } from "../tasks-dnd-provider";
import { ListTaskRow } from "../views/list/list-task-row";
import { ListTaskRowHead } from "../views/list/list-task-row-head";

export interface TaskFormProps {
  task?: TaskEntity;
  parentId?: string;
  customer?: CustomerShortInfo;
  onClose?: () => void;
  onCreated?: (task: TaskEntity) => void;
  status?: string;
  order?: number;
  dueDate?: number;
  folderId?: string | null;
  timeTrackings?: TaskTimeTracking[];
}

const formFieldHeight = 36;

export const TaskForm: FC<TaskFormProps> = (props) => {
  const workspace = useWorkspace();
  const taskFolders = useTaskFolders();
  const id = props.task?._id || "new_task_id";
  const uploadFile = useUploadFile();

  const tags = useTags();
  const tagFolder = tags.list.find(
    (v) => v._id === props.folderId || v._id === taskFolders.activatedFolder?._id
  );

  const isInitialized = useRef(false);
  const forceUpdate = useForceUpdate();

  const isSubmitting = useRef(false);
  const [rawFiles, setRawFiles] = useState<File[]>([]);

  const onUpdate = useDebouncedCallback((values: any) => {
    if (!props.task?._id || !values.name || !isInitialized.current) return;
    updateTasks([
      {
        ...props.task,
        name: values.name,
        description: values.description,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        startDate: values.startDate,
        customerId: values.relatedCustomer?._id,
        assigneeUserIds: values.assigneeUsers.map((user: WorkspaceMember) => user.userId),
        partnerIds: values.partners.map((partner: PartnerEntity) => partner._id),
        tagIds: values.tags.map((tag: TagEntity) => tag._id),
        timeTrackings: values.timeTrackings || [],
        estimatedTime: values.estimatedTime,
      },
    ]);
  }, 500);

  const form = useForm({
    initialValues: {} as any,
    onValuesChange: (values) => {
      if (props.task?._id) onUpdate(values);
    },
  });

  const onCreate = form.onSubmit(async (values) => {
    if (isSubmitting.current || !!props.task?._id) return;

    try {
      isSubmitting.current = true;
      forceUpdate();

      if (!values.name) throw Error(t`Task name is required`);

      await createTask({
        name: values.name,
        order: props.order,
        parentId: props.parentId,
        description: values.description,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        startDate: values.startDate,
        assigneeUserIds: values.assigneeUsers.map((user: WorkspaceMember) => user.userId),
        partnerIds: values.partners.map((partner: PartnerEntity) => partner._id),
        customerId: props.customer?._id,
        folderId: tagFolder?._id,
        tagIds: values.tags.map((tag: TagEntity) => tag._id),
        timeTrackings: values.timeTrackings || [],
        estimatedTime: values.estimatedTime,
      }).then(async (task) => {
        await Promise.all(
          rawFiles.map(async (file) =>
            uploadFile(file, { refs: [`${AppEntity.TASKS}:${task._id}`] }).catch(onError)
          )
        );
        props.onClose?.();
        props.onCreated?.(task);
      });
    } catch (error) {
      onError(error);
    } finally {
      isSubmitting.current = false;
      forceUpdate();
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

  useEffect(() => {
    isInitialized.current = false;
    form.setValues({
      ...props.task,
      tags: props.task?.tags || [],
      name: props.task?.name || "",
      partners: props.task?.partners || [],
      assigneeUsers: props.task?.assigneeUsers || [workspace.userMember],
      status: props.status || props.task?.status || DefaultTaskStatusId.TODO,
      description: props.task?.description || "",
      relatedCustomer: props.customer || props.task?.customer,
      dueDate: props.dueDate || props.task?.dueDate,
      timeTrackings: props.timeTrackings || props.task?.timeTrackings || [],
    });
    isInitialized.current = true;
    forceUpdate();
  }, [props.task?._id]);

  if (!isInitialized.current) return <Skeleton height={300} mt={16} />;

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
            <FormFieldWrapper icon={IconPlaystationCircle} label={t`Status`}>
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

            <FormFieldWrapper icon={IconUser} label={t`Assignee`}>
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
                  onChange={(users) => form.setFieldValue("assigneeUsers", users)}
                  style={{ cursor: "pointer" }}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconFlag} label={t`Priority`}>
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

            <FormFieldWrapper icon={IconCalendar} label={t`Due date`}>
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

            <FormFieldWrapper icon={IconStopwatch} label={t`Time trackings`}>
              <FormField
                canRemove={!!form.values.timeTrackings?.length}
                onRemove={() => form.setFieldValue("timeTrackings", [])}
              >
                <TimeTrackingsInput
                  p={5}
                  flex={1}
                  value={form.values.timeTrackings}
                  onChange={(timeTrackings) => form.setFieldValue("timeTrackings", timeTrackings)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconHourglassHigh} label={t`Estimate time`}>
              <FormField
                canRemove={!!form.values.estimatedTime}
                onRemove={() => form.setFieldValue("estimatedTime", null)}
              >
                <EstimateTimeInput
                  p={5}
                  flex={1}
                  label={t`Estimate time`}
                  {...form.getInputProps("estimatedTime")}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconUserSquareRounded} label={t`Customer`}>
              <FormField
                canRemove={!!form.values.relatedCustomer}
                onRemove={() => form.setFieldValue("relatedCustomer", null)}
              >
                <CustomerInput
                  flex={1}
                  p={5}
                  value={form.values.relatedCustomer}
                  onSelect={(partners) => form.setFieldValue("relatedCustomer", partners)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconTopologyStar3} label={t`Partners`}>
              <FormField
                canRemove={!!form.values.partners?.length}
                onRemove={() => form.setFieldValue("partners", [])}
              >
                <PartnersInput
                  flex={1}
                  p={5}
                  value={form.values.partners}
                  onChange={(partners) => form.setFieldValue("partners", partners)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconTags} label={t`Tags`}>
              <FormField
                canRemove={!!form.values.tags?.length}
                onRemove={() => form.setFieldValue("tags", [])}
              >
                <TagsInput
                  flex={1}
                  type={TagType.TASK}
                  value={form.values.tags}
                  onChange={(tags) => form.setFieldValue("tags", tags)}
                />
              </FormField>
            </FormFieldWrapper>
          </SimpleGrid>

          <Editor
            value={form.values.description}
            onChangeHTML={(v) => form.setFieldValue("description", v)}
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

            <Text fw={500}>{t`Attachments`}</Text>
          </Group>

          {props.task ? (
            <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${props.task._id}`]} />
          ) : (
            <FilesBox rawFiles={rawFiles} onChangeRawFiles={(files) => setRawFiles(files)} />
          )}
        </Stack>

        {!!props.task && !props.task.parentId && (
          <Stack gap={5}>
            <Group justify="start">
              <Group gap={8}>
                <ThemeIcon variant="light" color="dark">
                  <IconSubtask strokeWidth={1.5} size={20} />
                </ThemeIcon>

                <Text fw={500}>{t`Subtasks`}</Text>
              </Group>

              <Group gap={5}>
                <Text fz={15}>
                  <NumberFormat value={progress.percent} suffix="%" />
                </Text>
                <Progress value={progress.percent} w={70} color={progress.status.color || "dark"} />
              </Group>

              <Button
                size="compact-xs"
                color="gray.5"
                variant="outline"
                radius={100}
                leftIcon={IconPlus}
                onClick={() =>
                  OnModalCreateTask({
                    parentId: props.task!._id,
                    onCreated: () => subTaskList.fetch(true, { isSilient: true }),
                  })
                }
              >
                {t`Subtasks`}
              </Button>
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

                      {/* {subTasks.map((task, index) => {
                        return (
                          <ListTaskRow
                            key={task._id}
                            id={task._id}
                            showDivider={index < subTasks.length - 1}
                            limitName={20}
                            allowEditName={false}
                          />
                        );
                      })} */}
                    </Stack>
                  </Card>
                </Stack>
              </TasksDndProvider>
            )}
          </Stack>
        )}

        <Renderer visible={!!!props.task}>
          <Center>
            <Button
              loading={isSubmitting.current}
              onClick={onCreate}
              leftSection={<IconCheck strokeWidth={1.2} />}
              disabled={isSubmitting.current}
              type="submit"
              action
            >
              {t`Complete`}
            </Button>
          </Center>
        </Renderer>
      </Stack>
    </form>
  );
};

const FormFieldWrapper: FC<
  PropsWithChildren<{
    label: string;
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
