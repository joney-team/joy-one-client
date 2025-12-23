"use client";

import { Renderer } from "@/components/renderer";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { useLazyQuery } from "@apollo/client/react";
import { Container, Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconFiles } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { FC, Fragment, useEffect } from "react";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor/editor";
import { Modal } from "@/components/modal/modal";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDebouncedCallback } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import QUERY_TASK_BY_CODE, {
  type TaskByCodeQuery,
  type TaskByCodeQueryVariables,
} from "../../graphql/queryTaskByCode.graphql";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { TaskDetailSubtasks } from "../../task-detail-subtasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import { useTaskMenu } from "../task-menu/task-menu";
import { TaskDetailHead } from "./task-detail-head";

const TaskDetailProperties = dynamic(
  () => import("./task-detail-properties").then((mod) => mod.TaskDetailProperties),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const TaskActivities = dynamic(
  () => import("./task-detail-footer").then((mod) => mod.TaskActivities),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const FilesBox = dynamic(() => import("@/modules/files/files-box").then((mod) => mod.FilesBox), {
  ssr: false,
  loading: nonLoading,
});

export const TaskDetail: FC = () => {
  const router = useRouter();
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();

  const { code: taskCode } = useParams<{ code: string }>();

  const [getTask, { data, loading }] = useLazyQuery<TaskByCodeQuery, TaskByCodeQueryVariables>(
    QUERY_TASK_BY_CODE,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (!taskCode) return;
    getTask({ variables: { code: taskCode } });
  }, [taskCode]);

  const onClose = () => {
    router.push(updateTaskPath({ code: undefined }), { scroll: false });
  };

  const viewPadding = 22;
  const containerHeight = layout.height - viewPadding * 2;
  const headerHeight = 48;
  const contentHeight = containerHeight - headerHeight;
  const task = data?.taskByCode;

  const taskMenu = useTaskMenu({ task, groupVariables: null });
  const modalId = `task-detail-${taskCode}`;

  const debouncedUpdateTask = useDebouncedCallback(async (values: Partial<TaskDataFragment>) => {
    if (!task) return;

    const isDiff = JSON.stringify(task) !== JSON.stringify(values);
    if (!isDiff) return;

    if ("name" in values && (!values.name || values.name.length === 0)) return;

    await updateTasks({
      _id: task._id,
      ...values,
    });
  }, 500);

  return (
    <Modal
      id={modalId}
      opened={!!taskCode}
      onClose={onClose}
      withCloseButton={false}
      closeOnEscape={!taskMenu.isOpened}
      size={1400}
      yOffset={viewPadding}
      isFullscreenOnMobile
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {loading && !task && <Skeleton h={300} w="100%" />}

      {!!task && (
        <Fragment>
          <Renderer views={["mobile", "tablet"]}>
            <Stack>
              <Stack
                h={headerHeight}
                w="100%"
                style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
                py={8}
                px={8}
              >
                <TaskDetailHead key={modalId + "head"} task={task} close={onClose} />
              </Stack>

              <Stack p="sm">
                <ContentEditable
                  fz={25}
                  fw={500}
                  placeholder={t`Enter task name`}
                  defaultValue={task.name}
                  onChange={(value) => debouncedUpdateTask({ name: value })}
                />

                <Editor
                  defaultValue={task.description ?? ""}
                  onChangeHTML={(v) => {
                    debouncedUpdateTask({ description: v ?? "" });
                  }}
                  placeholder={t`Task description`}
                  uploadFileOptions={{
                    maxWidthOrHeight: 1500,
                    refs: [`${AppEntity.TASKS}:${task._id}`],
                  }}
                />

                <Stack gap="sm">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="gray">
                      <IconFiles strokeWidth={1.5} size={20} />
                    </ThemeIcon>

                    <Text fw={500} fz={14}>
                      <Trans>Attachments</Trans>
                    </Text>
                  </Group>

                  <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${task._id}`]} />
                </Stack>

                <TaskActivities key={modalId + "footer"} task={task} />
              </Stack>
            </Stack>
          </Renderer>

          <Renderer views={["desktop"]}>
            <Stack h={containerHeight} gap={0} miw={0} mih={0}>
              <Stack
                h={headerHeight}
                w="100%"
                style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
                px="sm"
              >
                <TaskDetailHead key={modalId + "head"} task={task} close={onClose} />
              </Stack>

              <Group align="start" flex={1} mih={0} style={{ overflow: "hidden" }}>
                <Stack py="sm" px="md" flex={1} miw={0} mah="100%" style={{ overflow: "auto" }}>
                  <Container w={800} maw="100%">
                    <Stack w="100%" gap="md">
                      <Stack gap="sm" pb="md">
                        <ContentEditable
                          fz={25}
                          fw={500}
                          placeholder={t`Enter task name`}
                          defaultValue={task.name}
                          onChange={(value) => debouncedUpdateTask({ name: value })}
                        />

                        <Editor
                          defaultValue={task.description ?? ""}
                          onChangeHTML={(v) => {
                            debouncedUpdateTask({ description: v ?? "" });
                          }}
                          placeholder={t`Task description`}
                          uploadFileOptions={{
                            maxWidthOrHeight: 1500,
                            refs: [`${AppEntity.TASKS}:${task._id}`],
                          }}
                          isShowToolbar={false}
                          isNonWrapped
                          style={{ padding: `0 0.25rem` }}
                        />
                      </Stack>

                      {!task.parent && (
                        <TaskDetailSubtasks key={modalId + "subtasks"} task={task} />
                      )}

                      <Stack gap="sm">
                        <Group gap="sm">
                          <ThemeIcon variant="light" color="gray">
                            <IconFiles strokeWidth={1.5} size={20} />
                          </ThemeIcon>

                          <Text fw={500} fz={14}>
                            <Trans>Attachments</Trans>
                          </Text>
                        </Group>

                        <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${task._id}`]} />
                      </Stack>

                      <TaskActivities key={modalId + "footer"} task={task} />
                    </Stack>
                  </Container>
                </Stack>

                <Stack
                  h={contentHeight}
                  mih={contentHeight}
                  w={300}
                  style={{ borderLeft: `1px solid ${workspaceLayout.dividerColor}` }}
                  gap="sm"
                >
                  <Group px="md" pt="sm">
                    <Text fz="sm" c="gray">
                      <Trans>Properties</Trans>
                    </Text>
                  </Group>

                  <TaskDetailProperties task={task} onClose={onClose} />
                </Stack>
              </Group>
            </Stack>
          </Renderer>
        </Fragment>
      )}
    </Modal>
  );
};
