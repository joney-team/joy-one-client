import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { Hovered } from "@/components/hovered";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { EstimateTimeInput } from "@/components/inputs/estimate-time-input";
import { TimeTrackingsInput } from "@/components/inputs/time-trackings-input";
import { UsersInput } from "@/components/inputs/users-input";
import { Renderer } from "@/components/renderer";
import { TaskPrioritySelector } from "@/components/selector/task-priority-selector";
import { TaskStatusSelector } from "@/components/selector/task-status-selector";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { onUploadFile } from "@/modules/files/file-service";
import { num, renderDate, renderDateTime, t } from "@/modules/lang/lang-service";
import { PartnersInput } from "@/modules/partners/partners-input";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { useTags } from "@/modules/tags/tags-context";
import { TagsInput } from "@/modules/tags/tags-input";
import { TagType } from "@/modules/tags/tags-types";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import {
  createTask,
  getTaskPriorityColor,
  getTaskProgress,
  getTasks,
  renderTaskStatusStyle,
  updateTasks,
} from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity, TaskTimeTracking } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { AppEntity } from "@/types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { onError } from "@/utils/exceptions.utils";
import { useList } from "@/utils/use-list.util";
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
import dayjs from "dayjs";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { CustomerInput } from "../customers/customer-input";
import { FilesBox } from "../files/files-box";
import { useTaskFolders } from "./hooks/use-task-folders";
import { ListTaskRow } from "./views/list/list.task-row";
import { ListTaskRowHead } from "./views/list/list.task-row-head";

export interface TaskFormProps {
  task?: TaskEntity;
  parentId?: string;
  customer?: CustomerShortInfo;
  onClose?: () => void;
  onCreated?: (task: TaskEntity) => void;
  status?: string;
  order?: number;
  dueDate?: number;
  tagFolderId?: string | null;
  timeTrackings?: TaskTimeTracking[];
}

const formFieldHeight = 36;

export const TaskForm: FC<TaskFormProps> = (props) => {
  const workspace = useWorkspace();
  const taskFolders = useTaskFolders();
  const id = props.task?._id || "new_task_id";

  const tags = useTags();
  const tagFolder = tags.list.find((v) => v._id === props.tagFolderId || v._id === taskFolders.tagFolder?._id);

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
        relatedCustomerId: values.relatedCustomer?._id,
        assigneeUserIds: values.assigneeUsers.map((user: WorkspaceMember) => user.userId),
        partnerIds: values.partners.map((partner: PartnerEntity) => partner._id),
        tagIds: values.tagIds,
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

      if (!values.name) throw Error(t("task_name_required"));

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
        relatedCustomerId: props.customer?._id,
        tagFolderId: tagFolder?._id,
        tagIds: values.tagIds,
        timeTrackings: values.timeTrackings || [],
        estimatedTime: values.estimatedTime,
      }).then(async (task) => {
        await Promise.all(rawFiles.map(async (file) => onUploadFile({ file, ref: task._id }).catch(onError)));
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
    form.values.dueDate < DateTimeUtils.timeToSeconds() &&
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
      name: props.task?.name || "",
      partners: props.task?.partners || [],
      assigneeUsers: props.task?.assigneeUsers || [workspace.userMember],
      status: props.status || props.task?.status || DefaultTaskStatusId.TODO,
      description: props.task?.description || "",
      relatedCustomer: props.customer || props.task?.relatedCustomer,
      dueDate: props.dueDate || props.task?.dueDate,
      timeTrackings: props.timeTrackings || props.task?.timeTrackings || [],
      tagIds: props.task?.tagIds || [],
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
            placeholder={t("enter_task_name")}
            value={form.values.name}
            onChange={(value) => form.setFieldValue("name", value)}
            onEnter={!props.task ? () => onCreate() : undefined}
          />

          <SimpleGrid cols={{ md: 2 }} spacing={3} maw="100%" w={900}>
            <FormFieldWrapper icon={IconPlaystationCircle} label={t("status")}>
              <TaskStatusSelector
                inputProps={{ flex: 1 }}
                onSelect={(status) => form.setFieldValue("status", status.id)}
                render={(ctx) => {
                  const statusStyled = renderTaskStatusStyle(form.values.status, workspace.settings.taskStatuses);
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
                            <Tooltip label={`${t("next_status")} ${nextStatus.name}`}>
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
                              <Tooltip label={t("task_complete")}>
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

            <FormFieldWrapper icon={IconUser} label={t("assignee")}>
              <FormField
                canRemove={(form.values.assigneeUsers?.length || 0) > 0}
                onRemove={() => form.setFieldValue("assigneeUsers", [])}
              >
                <UsersInput
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

            <FormFieldWrapper icon={IconFlag} label={t("priority")}>
              <FormField canRemove={!!form.values.priority} onRemove={() => form.setFieldValue("priority", null)}>
                <TaskPrioritySelector
                  inputProps={{ flex: 1 }}
                  onSelect={(priority) => form.setFieldValue("priority", priority)}
                  render={(ctx) => {
                    return (
                      <Group style={{ cursor: "pointer" }} flex={1} h={formFieldHeight} p={5} onClick={ctx.toggle}>
                        {(function () {
                          if (form.values.priority) {
                            return (
                              <Group gap={1}>
                                <ThemeIcon color={getTaskPriorityColor(form.values.priority)} variant="transparent">
                                  <IconFlagFilled size={20} />
                                </ThemeIcon>
                                <Text>{t(`task_priority_${form.values.priority}`)}</Text>
                              </Group>
                            );
                          }

                          return (
                            <Text c="gray" fz={em(13)} px={3}>
                              {t("add_priority")}
                            </Text>
                          );
                        })()}
                      </Group>
                    );
                  }}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconCalendar} label={t("due_date")}>
              <FormField
                onRemove={() => form.setValues({ ...form.values, dueDate: null, startDate: null })}
                canRemove={!!form.values.dueDate || !!form.values.startDate}
              >
                <Menu>
                  <Menu.Target>
                    <Group style={{ cursor: "pointer", flex: 1 }} mih={formFieldHeight} p={5}>
                      {(function () {
                        if (form.values.dueDate && form.values.startDate) {
                          if (DateTimeUtils.isMatchDay(form.values.dueDate * 1000, form.values.startDate * 1000)) {
                            return (
                              <Group c={isOutdated ? "red" : "var(--mantine-color-text)"} gap={5}>
                                <Text>{dayjs(form.values.startDate * 1000).format("HH:mm")}</Text> <Text>-</Text>{" "}
                                <Text>
                                  {dayjs(form.values.dueDate * 1000).format("HH:mm")} {renderDate(form.values.dueDate)}
                                </Text>
                              </Group>
                            );
                          }

                          if (dayjs(form.values.startDate * 1000).isSame(dayjs(form.values.dueDate * 1000), "month")) {
                            return (
                              <Group c={isOutdated ? "red" : "var(--mantine-color-text)"} gap={5}>
                                <Text>{dayjs(form.values.startDate * 1000).format("HH:mm DD/MM")}</Text> <Text>-</Text>{" "}
                                <Text>
                                  {dayjs(form.values.dueDate * 1000).format("HH:mm")} {renderDate(form.values.dueDate)}
                                </Text>
                              </Group>
                            );
                          }

                          return (
                            <Text c={isOutdated ? "red" : "var(--mantine-color-text)"}>
                              {renderDateTime(form.values.startDate, true)} -{" "}
                              {renderDateTime(form.values.dueDate, true)}
                            </Text>
                          );
                        }

                        if (form.values.dueDate) {
                          return (
                            <Text c={isOutdated ? "red" : "var(--mantine-color-text)"}>
                              {renderDateTime(form.values.dueDate, true)}
                            </Text>
                          );
                        }

                        return (
                          <Text c="gray" fz={em(13)} px={3}>
                            {t("add_due_date")}
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

            <FormFieldWrapper icon={IconStopwatch} label="tasks_view_time_trackings">
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

            <FormFieldWrapper icon={IconHourglassHigh} label={t("tasks_view_estimate_time")}>
              <FormField
                canRemove={!!form.values.estimatedTime}
                onRemove={() => form.setFieldValue("estimatedTime", null)}
              >
                <EstimateTimeInput
                  p={5}
                  flex={1}
                  label={t("tasks_view_estimate_time")}
                  {...form.getInputProps("estimatedTime")}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconUserSquareRounded} label={t("customer")}>
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

            <FormFieldWrapper icon={IconTopologyStar3} label={t("partners")}>
              <FormField canRemove={!!form.values.partners?.length} onRemove={() => form.setFieldValue("partners", [])}>
                <PartnersInput
                  flex={1}
                  p={5}
                  value={form.values.partners}
                  onChange={(partners) => form.setFieldValue("partners", partners)}
                />
              </FormField>
            </FormFieldWrapper>

            <FormFieldWrapper icon={IconTags} label={t("tags")}>
              <FormField canRemove={!!form.values.tagIds?.length} onRemove={() => form.setFieldValue("tagIds", [])}>
                <TagsInput
                  flex={1}
                  type={TagType.TASK}
                  value={form.values.tagIds}
                  onChange={(tags) => form.setFieldValue("tagIds", tags)}
                />
              </FormField>
            </FormFieldWrapper>
          </SimpleGrid>

          <Editor
            value={form.values.description}
            onChange={(v) => form.setFieldValue("description", v)}
            delay={300}
            placeholder={t("task_description")}
            uploadFileOptions={{
              maxWidthOrHeight: 1500,
              relatedTaskId: props.task?._id,
            }}
          />
        </Stack>

        <Stack gap={8}>
          <Group gap={8}>
            <ThemeIcon variant="light" color="dark">
              <IconFiles strokeWidth={1.5} size={20} />
            </ThemeIcon>

            <Text fw={500}>{t("attachments")}</Text>
          </Group>

          {props.task ? (
            <FilesBox
              autoUpload
              query={{
                entity: AppEntity.TASKS,
                entityId: props.task?._id,
              }}
            />
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

                <Text fw={500}>{t("subtasks")}</Text>
              </Group>

              <Group gap={5}>
                <Text fz={em(15)}>{num(progress.percent, { roundPrecision: 0 })}%</Text>
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
                {t("subtasks")}
              </Button>
            </Group>

            {subTasks.length > 0 && (
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
              {t("complete")}
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
          {t(props.label)}
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
