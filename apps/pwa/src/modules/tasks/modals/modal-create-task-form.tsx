"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor/editor";
import { TaskStatusesContextType } from "@/graphql/enums.graphql";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { createObjectId } from "@joy-one-client/utils/object-id";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { Center, Group, Skeleton, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconCalendar,
  IconFlag,
  IconFlagFilled,
  IconPlus,
  IconTags,
  IconTagsFilled,
} from "@tabler/icons-react";
import { FC, Fragment, useEffect } from "react";
import { TaskTimeline } from "../components/task-timeline";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import CREATE_TASK_MUTATION, {
  type CreateTaskMutation,
  type CreateTaskMutationVariables,
} from "../graphql/mutationCreateTask.graphql";
import TASK_STATUS_QUERY, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../graphql/queryTaskStatuses.graphql";
import { useTaskStatuses } from "../hooks/use-task-statuses";
import { useTaskMenu } from "../modules/task-menu/task-menu";
import { TaskMenuAction } from "../modules/task-menu/task-menu-types";
import { taskPriorities } from "../task-constants";
import { DefaultTaskStatusId, TaskPriority } from "../tasks-types";

export interface CreateTaskFormProps {
  initial?: Partial<TaskDataFragment>;
  onCreated?: (id: string) => void;
  onClose?: () => void;
}

export const CreateTaskForm: FC<CreateTaskFormProps> = ({ initial, onCreated, onClose }) => {
  const { t } = useLingui();
  const taskId = createObjectId();

  const [getTaskStatuses, { data: taskStatusesData, loading: taskStatusesLoading }] = useLazyQuery<
    TaskStatusesQuery,
    TaskStatusesQueryVariables
  >(TASK_STATUS_QUERY);

  useEffect(() => {
    getTaskStatuses({
      variables: initial?.folder
        ? { contextType: TaskStatusesContextType.Folder, contextId: initial.folder._id }
        : undefined,
    });
  }, [initial]);

  const [createTask] = useMutation<CreateTaskMutation, CreateTaskMutationVariables>(
    CREATE_TASK_MUTATION
  );

  const form = useForm<Partial<TaskDataFragment> & { status: TaskDataFragment["status"] }>({
    initialValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      tags: initial?.tags ?? [],
      status: initial?.status ?? DefaultTaskStatusId.TODO,
      statuses: taskStatusesData?.taskStatuses ?? [],
      ...initial,
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const { data: newTask } = await createTask({
        variables: {
          input: {
            _id: taskId,
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
      onCreated?.(newTask.createTask._id);
      onClose?.();
    } catch (error) {
      onError(error);
    }
  });

  const taskMenu = useTaskMenu({
    task: { ...form.values, _id: taskId, statuses: taskStatusesData?.taskStatuses ?? [] },
    groupVariables: null,
    updateTask: async (task) => {
      form.setValues({ ...form.values, ...task });
    },
  });

  const taskStatuses = useTaskStatuses({
    status: form.values.status,
    statuses: taskStatusesData?.taskStatuses ?? [],
  });

  if (taskStatusesLoading) return <Skeleton height={100} miw="100%" />;

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Stack px={16}>
          <ContentEditable
            fz={25}
            fw={500}
            autoFocus
            placeholder={t`Enter task name`}
            value={form.values.name}
            onChange={(value) => form.setFieldValue("name", value)}
            onEnter={onSubmit}
          />

          <Editor
            value={form.values.description}
            onChangeHTML={(v) => form.setFieldValue("description", v ?? "")}
            delay={300}
            placeholder={t`Task description`}
            uploadFileOptions={{
              maxWidthOrHeight: 1500,
              refs: [`${AppEntity.TASKS}:${form.values._id}`],
            }}
          />
        </Stack>

        <Group px={16}>
          <Group gap={10} flex={1} justify="center" align="center">
            {taskStatuses.status && (
              <Button
                radius={5}
                size="compact-sm"
                tt="uppercase"
                fz={11}
                variant="light"
                color={taskStatuses.status.color ?? "gray"}
                onClick={(e) =>
                  taskMenu.open({
                    action: TaskMenuAction.CHANGE_STATUS,
                    target: e.currentTarget,
                    offset: { y: 3 },
                  })
                }
                leftSection={
                  <Circle
                    style={{ marginRight: -4 }}
                    size={10}
                    color={taskStatuses.status.color ?? "gray"}
                  />
                }
              >
                {taskStatuses.status.name}
              </Button>
            )}

            <Button
              radius={5}
              size="compact-sm"
              variant="outline"
              color={form.values.dueDate ? "dark" : "gray.5"}
              fz={11}
              onClick={(e) =>
                taskMenu.open({
                  action: TaskMenuAction.CHANGE_TIMELINE,
                  target: e.currentTarget,
                  offset: { y: 3 },
                })
              }
              leftIcon={IconCalendar}
            >
              {form.values.dueDate ? (
                <TaskTimeline
                  task={{
                    startDate: form.values.startDate ?? null,
                    dueDate: form.values.dueDate ?? null,
                  }}
                />
              ) : (
                <Trans>Due date</Trans>
              )}
            </Button>

            <Button
              radius={5}
              size="compact-sm"
              variant="outline"
              fz={11}
              onClick={(e) =>
                taskMenu.open({
                  action: TaskMenuAction.CHANGE_PRIORITY,
                  target: e.currentTarget,
                  offset: { y: 3 },
                })
              }
              leftIcon={form.values.priority ? IconFlagFilled : IconFlag}
              color={
                form.values.priority
                  ? taskPriorities[form.values.priority as TaskPriority].color
                  : "gray.5"
              }
            >
              {form.values.priority ? (
                taskPriorities[form.values.priority as TaskPriority].label()
              ) : (
                <Trans>Priority</Trans>
              )}
            </Button>

            <Button
              radius={5}
              size="compact-sm"
              variant="outline"
              fz={11}
              onClick={(e) =>
                taskMenu.open({
                  action: TaskMenuAction.CHANGE_TAGS,
                  target: e.currentTarget,
                  offset: { y: 3 },
                })
              }
              leftIcon={form.values.priority ? IconTagsFilled : IconTags}
              color={form.values.tags && form.values.tags.length > 0 ? "dark" : "gray.5"}
            >
              {form.values.tags && form.values.tags.length > 0 ? (
                <Fragment>
                  <Plural value={form.values.tags.length} one="# tag" other="# tags" />
                </Fragment>
              ) : (
                <Trans>Tags</Trans>
              )}
            </Button>
          </Group>
        </Group>

        <Center mt={12}>
          <Button leftIcon={IconPlus} type="submit" loading={form.submitting}>
            <Trans>Add</Trans>
          </Button>
        </Center>
      </Stack>
    </form>
  );
};
