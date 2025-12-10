"use client";

import { Renderer } from "@/components/renderer";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { CommentBox } from "@/modules/comments/comment-box";
import { TaskDetailForm } from "@/modules/tasks/modules/task-detail/task-detail-form";
import { useColor } from "@/modules/theme/use-color";
import { useLazyQuery } from "@apollo/client/react";
import {
  Card,
  Container,
  CopyButton,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCopy, IconCopyCheck, IconFiles } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { FC, Fragment, useEffect, useState } from "react";
import { TaskDetailFooter } from "./task-detail-footer";

import { Modal } from "@/components/modal/modal";
import { Trans } from "@lingui/react/macro";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import QUERY_TASK_BY_CODE, {
  type TaskByCodeQuery,
  type TaskByCodeQueryVariables,
} from "../../graphql/queryTaskByCode.graphql";
import { TaskDetailSubtasks } from "../../task-detail-subtasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import { useTaskMenu } from "../task-menu/task-menu";
import { TaskDetailHead } from "./task-detail-head";
import { FilesBox } from "@/modules/files/files-box";
import { AppEntity } from "@/types";

const TaskCodeButton: FC<{ task: TaskDataFragment }> = (props) => {
  const { task } = props;
  const hover = useHover();
  const color = useColor();

  return (
    <Group style={{ position: "relative" }}>
      <CopyButton value={task.code}>
        {({ copied, copy }) => (
          <Tooltip label={<Trans>Copy code</Trans>}>
            <Group>
              <Card
                withBorder
                shadow="none"
                h={26}
                py={0}
                px={8}
                onClick={copy}
                style={{ cursor: "pointer" }}
                ref={hover.ref}
              >
                <Group h="100%" align="center" gap={5}>
                  <Text fz={13} c="var(--mantine-color-dimmed)" fw={500}>
                    {task.code}
                  </Text>

                  <Renderer visible={hover.hovered && !copied}>
                    <IconCopy size={13} color="var(--mantine-color-dimmed)" />
                  </Renderer>

                  <Renderer visible={copied}>
                    <IconCopyCheck size={13} color={color("primary")} />
                  </Renderer>
                </Group>
              </Card>
            </Group>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
};

export const TaskDetail: FC = () => {
  const router = useRouter();
  const viewport = useLayout();
  const workspaceLayout = useWorkspaceLayout();

  const { code: taskCode } = useParams<{ code: string }>();
  const [version, setVersion] = useState(0);

  const [getTask, { data, loading }] = useLazyQuery<TaskByCodeQuery, TaskByCodeQueryVariables>(
    QUERY_TASK_BY_CODE,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (taskCode) {
      getTask({ variables: { code: taskCode } }).then(() => setVersion((v) => v + 1));
    }
  }, [taskCode]);

  const onClose = () => {
    setVersion((v) => v + 1);
    router.push(updateTaskPath({ code: undefined }), { scroll: false });
  };

  const viewPadding = 25;
  const height = viewport.height - viewPadding * 4;
  const headerHeight = 50;
  const contentHeight = height - headerHeight;
  const task = data?.taskByCode;

  const taskMenu = useTaskMenu({ task, groupVariables: null });
  const modalId = `task-detail-${taskCode}-${version}`;

  return (
    <Modal
      id={modalId}
      opened={!!taskCode}
      onClose={onClose}
      withCloseButton={false}
      closeOnEscape={!taskMenu.isOpened}
      size={1600}
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

              <Stack>
                <TaskCodeButton key={modalId + "code"} task={task} />
                <TaskDetailForm key={modalId + "form"} task={task} />
                <Stack gap={8}>
                  <Group gap={8}>
                    <ThemeIcon variant="light" color="gray">
                      <IconFiles strokeWidth={1.5} size={20} />
                    </ThemeIcon>

                    <Text fw={500} fz={14}>
                      <Trans>Attachments</Trans>
                    </Text>
                  </Group>

                  <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${task._id}`]} />
                </Stack>
                <TaskDetailFooter key={modalId + "footer"} task={task} onClose={onClose} />
              </Stack>
            </Stack>
          </Renderer>

          <Renderer views={["desktop"]}>
            <Stack h={height} gap={0}>
              <Stack
                h={headerHeight}
                w="100%"
                style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
                py={8}
                pl={16}
                pr={8}
              >
                <TaskDetailHead key={modalId + "head"} task={task} close={onClose} />
              </Stack>

              <Group h={contentHeight} w="100%" gap={0} wrap="nowrap">
                <Stack flex={1} h={contentHeight} mih={contentHeight} style={{ overflow: "auto" }}>
                  <Container pt={10} pb={16} px={32}>
                    <TaskCodeButton key={modalId + "code"} task={task} />

                    <Stack gap={30}>
                      <TaskDetailForm key={modalId + "form"} task={task} />
                      {!task.parent && (
                        <TaskDetailSubtasks key={modalId + "subtasks"} task={task} />
                      )}

                      <Stack gap={8}>
                        <Group gap={8}>
                          <ThemeIcon variant="light" color="gray">
                            <IconFiles strokeWidth={1.5} size={20} />
                          </ThemeIcon>

                          <Text fw={500} fz={14}>
                            <Trans>Attachments</Trans>
                          </Text>
                        </Group>

                        <FilesBox autoUpload refs={[`${AppEntity.TASKS}:${task._id}`]} />
                      </Stack>
                      <TaskDetailFooter key={modalId + "footer"} task={task} onClose={onClose} />
                    </Stack>
                  </Container>
                </Stack>

                <Stack
                  w={450}
                  h={contentHeight}
                  mih={contentHeight}
                  style={{ borderLeft: `1px solid ${workspaceLayout.dividerColor}` }}
                  gap={0}
                >
                  <CommentBox key={modalId + "comment"} ref={task._id} />
                </Stack>
              </Group>
            </Stack>
          </Renderer>
        </Fragment>
      )}
    </Modal>
  );
};
