"use client";

import { CommentBox } from "@/modules/comments/comment-box";
import { Renderer } from "@/components/renderer";
import { TaskForm } from "@/modules/tasks/task-form";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useRouter } from "@/hooks/use-router";
import { t } from "@/modules/lang/lang-service";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskByCode, getTaskEntity, getTaskEntityByCode } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { onError } from "@/utils/exceptions.utils";
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
import { useDisclosure, useHover } from "@mantine/hooks";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { FC, Fragment, useEffect, useState } from "react";
import { DetailFooter } from "./detail-footer";
import { TaskDetailHead } from "./detail-head";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { zIndexes } from "../../../../../../packages/config/layout";

export const TaskDetail: FC = () => {
  const router = useRouter();
  const params = useParams();
  const viewport = useLayout();
  const taskCode = params.code as string;
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();

  const [taskId, setTaskId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const tasks = useTasks();

  const onClose = () => {
    close();
    router.push(`/tasks/${tasks.view}/${tasks.tagFolder?.slug || "d"}`, {}, { scroll: false });
  };

  const onOpen = async (taskId: string) => {
    setTaskId(taskId);
    open();
  };

  const fetchTaskByCode = async (code: string) => {
    const entity = getTaskEntityByCode(code);
    if (entity) {
      onOpen(entity._id);
    } else {
      getTaskByCode(code)
        .then((t) => onOpen(t._id))
        .catch((error) => {
          onError(error);
          router.back();
        });
    }
  };

  useEffect(() => {
    if (taskCode) {
      fetchTaskByCode(taskCode);
    } else {
      close();
    }
  }, [taskCode]);

  const task = getTaskEntity(taskId);

  const viewPadding = 25;
  const height = viewport.height - viewPadding * 4;
  const headerHeight = 50;
  const contentHeight = height - headerHeight;

  return (
    <Modal
      opened={opened}
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
      {!!task ? (
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

                <TaskForm
                  key={task._id + "form"}
                  task={task}
                  customer={task.relatedCustomer}
                  tagFolderId={task!.tagFolderId}
                />

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
                        <TaskForm
                          key={task._id + "form"}
                          task={task}
                          customer={task.relatedCustomer}
                          tagFolderId={task!.tagFolderId}
                        />

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
      ) : (
        <Skeleton h={300} w="100%" />
      )}
    </Modal>
  );
};

const TaskCodeButton: FC<{ task: TaskEntity }> = (props) => {
  const { task } = props;
  const hover = useHover();
  const color = useColor();

  return (
    <Group style={{ position: "relative" }}>
      <CopyButton value={task.code}>
        {({ copied, copy }) => (
          <Tooltip label={t("copy_code")}>
            <Group>
              <Card
                withBorder
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
