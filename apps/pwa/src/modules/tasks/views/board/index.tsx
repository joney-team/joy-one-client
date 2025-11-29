"use client";

import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageLayout = document.getElementById("LayoutPage");

    if (pageLayout && scrollAreaRef.current) {
      const container = scrollAreaRef.current.getBoundingClientRect();

      scrollAreaRef.current.style.height = `calc(100dvh - ${container.top}px)`;

      if (pageLayout) {
        pageLayout.style.height = "100dvh";
      }

      return () => {
        if (pageLayout) {
          pageLayout.style.height = "auto";
        }
      };
    }
  }, []);

  const dynamicStatuses = useMemo(() => {
    return workspace.settings.taskStatuses.filter((v) => !v.isDefault);
  }, [workspace.settings.taskStatuses]);

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
            style={{
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <Group
              ref={scrollAreaRef}
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

              {dynamicStatuses.map((status) => (
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
