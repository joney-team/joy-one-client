"use client";

import { Button } from "@/components/buttons/button";
import { TaskContextType } from "@/graphql/enums.graphql";
import { useTasks } from "@/modules/tasks/tasks-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, useEffect, useRef } from "react";
import { useFolderStatuses } from "../../hooks/use-task-statuses";

const ModalConfigureStatuses = dynamic(
  () =>
    import("@/modules/tasks/modals/modal-configure-statuses").then(
      (mod) => mod.ModalConfigureStatuses
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const BoardGroupByStatuses = dynamic(
  () => import("./board-tasks-group").then((mod) => mod.BoardTasksGroup),
  {
    ssr: false,
    loading: () => <Skeleton height={500} w={300} />,
  }
);

export const TasksBoardView: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const { activatedFolder, isReady, state } = useTasks();
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
  }, [isReady]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    return autoScrollForElements({
      element: scrollAreaRef.current,
      getAllowedAxis: () => "horizontal",
    });
  }, []);

  const statuses = useFolderStatuses(activatedFolder?._id);

  return (
    <Stack id="TasksBoardView" gap={0} mih={0} flex={1} miw={0}>
      {isReady ? (
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
              p="sm"
              gap="sm"
              mih={0}
            >
              {statuses.inprogress.map((status, statusIndex) => (
                <BoardGroupByStatuses key={status.id + statusIndex} status={status} />
              ))}

              {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                <ModalConfigureStatuses>
                  {(modal) => (
                    <Card
                      withBorder
                      shadow="none"
                      p="xs"
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
                          fz={12}
                          onClick={() =>
                            modal.open({
                              contextType: activatedFolder ? TaskContextType.Folder : null,
                              contextId: activatedFolder?._id ?? null,
                              autoCreation: true,
                            })
                          }
                        >
                          <Trans>Add status</Trans>
                        </Button>
                      </Group>
                    </Card>
                  )}
                </ModalConfigureStatuses>
              )}

              {state.showClosed &&
                statuses.closed.map((status, statusIndex) => (
                  <BoardGroupByStatuses key={status.id + statusIndex} status={status} />
                ))}
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
