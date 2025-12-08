"use client";

import { Renderer } from "@/components/renderer";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { CommentBox } from "@/modules/comments/comment-box";
import { TaskForm } from "@/modules/tasks/components/form-task";
import { useColor } from "@/modules/theme/use-color";
import { useLazyQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import {
  Card,
  Container,
  CopyButton,
  Group,
  Modal,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FC, Fragment, useEffect, useState } from "react";
import { DetailFooter } from "./components/detail-footer";

import { TaskDetailHead } from "./components/task-detail-head";
import { TaskDataFragment } from "./graphql/fragmentTask.graphql";
import QUERY_TASK_BY_CODE, {
  type TaskByCodeQuery,
  type TaskByCodeQueryVariables,
} from "./graphql/queryTaskByCode.graphql";
import { TaskDetailSubtasks } from "./task-detail-subtasks";

export const TaskDetail: FC = () => {
  const router = useRouter();
  const viewport = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const pathname = usePathname();
  const { code: taskCode } = useParams<{ code: string }>();
  const [version, setVersion] = useState(0);

  const [getTask, { data, loading }] = useLazyQuery<TaskByCodeQuery, TaskByCodeQueryVariables>(
    QUERY_TASK_BY_CODE,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (taskCode) {
      getTask({ variables: { code: taskCode } });
    }
  }, [taskCode]);

  const onClose = () => {
    setVersion((v) => v + 1);
    router.push(pathname.replace(`/${taskCode}`, ""), { scroll: false });
  };

  const viewPadding = 25;
  const height = viewport.height - viewPadding * 4;
  const headerHeight = 50;
  const contentHeight = height - headerHeight;
  const task = data?.taskByCode;

  return (
    <Modal
      opened={!!taskCode}
      onClose={onClose}
      withCloseButton={false}
      size={1600}
      yOffset={viewPadding}
      fullScreen={viewport.view !== "desktop"}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {loading && <Skeleton h={300} w="100%" />}

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
                <TaskDetailHead key={task._id + "head"} task={task} close={onClose} />
              </Stack>

              <Stack px={16} pb={16}>
                <TaskCodeButton key={task._id + "code"} task={task} />
                <TaskForm key={task._id + version} task={task} />
                <DetailFooter task={task} onClose={onClose} />
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
                <TaskDetailHead key={task._id + "head"} task={task} close={onClose} />
              </Stack>

              <Group h={contentHeight} w="100%" gap={0} wrap="nowrap">
                <Stack flex={1} h={contentHeight}>
                  <ScrollArea.Autosize mah="100%" scrollbarSize={8}>
                    <Container pt={10} pb={16} px={32}>
                      <TaskCodeButton key={task._id + "code"} task={task} />

                      <Stack gap={30}>
                        <TaskForm key={task._id + version} task={task} />
                        <TaskDetailSubtasks task={task} />
                        <DetailFooter task={task} onClose={onClose} />
                      </Stack>
                    </Container>
                  </ScrollArea.Autosize>
                </Stack>

                <Stack
                  w={450}
                  h={contentHeight}
                  style={{ borderLeft: `1px solid ${workspaceLayout.dividerColor}` }}
                  gap={0}
                >
                  <CommentBox key={task._id} ref={task._id + "comment"} />
                </Stack>
              </Group>
            </Stack>
          </Renderer>
        </Fragment>
      )}
    </Modal>
  );
};

const TaskCodeButton: FC<{ task: TaskDataFragment }> = (props) => {
  const { task } = props;
  const hover = useHover();
  const color = useColor();

  return (
    <Group style={{ position: "relative" }}>
      <CopyButton value={task.code}>
        {({ copied, copy }) => (
          <Tooltip label={t`Copy code`}>
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
