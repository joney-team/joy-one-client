"use client";

import { Button } from "@/components/buttons/button";
import { TaskStatusesContextType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useQuery } from "@apollo/client/react";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import QUERY_TASK_STATUSES, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../../queries/queryTaskStatuses.graphql";

const BoardGroupByStatuses = dynamic(
  () => import("./board-group-by-statuses").then((mod) => mod.BoardGroupByStatuses),
  {
    ssr: false,
    loading: () => <Skeleton height={500} w={300} />,
  }
);

export const TasksBoardView: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const tasks = useTasks();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageLayout = document.getElementById("LayoutPage");
    const scrollArea = containerRef.current;

    if (pageLayout && scrollArea) {
      const calculateScrollArea = () => {
        const container = scrollArea.getBoundingClientRect();
        scrollArea.style.minHeight = `calc(100dvh - ${container.top}px)`;
        scrollArea.style.maxHeight = `calc(100dvh - ${container.top}px)`;
        pageLayout.style.height = "100dvh";
      };

      window.addEventListener("resize", calculateScrollArea);
      calculateScrollArea();

      return () => {
        window.removeEventListener("resize", calculateScrollArea);
        pageLayout.style.removeProperty("height");
      };
    }
  }, [tasks.isReady]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    return autoScrollForElements({
      element: scrollAreaRef.current,
      getAllowedAxis: () => "horizontal",
    });
  }, []);

  const taskStatusesData = useQuery<TaskStatusesQuery, TaskStatusesQueryVariables>(
    QUERY_TASK_STATUSES,
    {
      variables: tasks.activatedFolder
        ? {
            contextType: TaskStatusesContextType.Folder,
            contextId: tasks.activatedFolder?._id,
          }
        : {},
    }
  );

  const dynamicTaskStatuses = useMemo(() => {
    return (taskStatusesData.data?.taskStatuses ?? []).filter(
      (v) => !Object.values<string>(DefaultTaskStatusId).includes(v.id)
    );
  }, [taskStatusesData.data]);

  return (
    <Stack id="TasksBoardView" gap={0} mih={0} flex={1} miw={0}>
      {layout.view !== "mobile" && (
        <Group p={16}>
          <TaskMenuActions />
        </Group>
      )}

      {tasks.isReady ? (
        <Stack gap={0} flex={1} miw={0} style={{ overflow: "hidden" }}>
          <Group
            id="BoardHorizontalScroll"
            w="100%"
            align="stretch"
            flex={1}
            mih={0}
            ref={scrollAreaRef}
            style={{
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <Group
              ref={containerRef}
              wrap="nowrap"
              w="max-content"
              align="stretch"
              flex={1}
              px={16}
              mih={0}
              pb={16}
            >
              <BoardGroupByStatuses
                key={DefaultTaskStatusId.TODO}
                statusId={DefaultTaskStatusId.TODO}
              />

              {dynamicTaskStatuses.map((status) => (
                <BoardGroupByStatuses key={status.id} statusId={status.id} />
              ))}

              {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                <Card
                  withBorder
                  shadow="none"
                  p={10}
                  w={300}
                  style={{
                    background: "transparent",
                    border: "1px dashed rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Group>
                    <Button
                      variant="light"
                      color="gray"
                      size="xs"
                      leftIcon={IconPlus}
                      iconSize={16}
                      fz={12}
                      onClick={() => OnTaskSatusesModal()}
                    >
                      <Trans>Add status</Trans>
                    </Button>
                  </Group>
                </Card>
              )}

              {tasks.state.showClosed && (
                <BoardGroupByStatuses
                  key={DefaultTaskStatusId.CLOSED}
                  statusId={DefaultTaskStatusId.CLOSED}
                />
              )}
            </Group>
          </Group>
        </Stack>
      ) : (
        <Stack px={16}>
          <Skeleton height={500} />
        </Stack>
      )}

      {props.children}
    </Stack>
  );
};
