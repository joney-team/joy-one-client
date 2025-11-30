"use client";

import { LayoutSplit } from "@/components/layout-split";
import { configs } from "@/configs/layout.config";
import { useLayout } from "@/layout/layout-context";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { ActionIcon, Card, Divider, Group, ScrollArea, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useEffect } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { ganttConfig } from "./gantt-tasks-config";
import { useGantt } from "./gantt-tasks-context";
import { BodyHead, GridColumns, SidebarHead } from "./gantt-tasks-layout";
import { GanttProvider } from "./gantt-tasks-provider";
import { GanttTaskGroupByFolders } from "./gantt-tasks-group-by-folder";
import { TasksDndProvider } from "../../tasks-dnd-provider";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";

const Content: FC = () => {
  const layout = useLayout();
  const gantt = useGantt();
  const container = useElementSize();
  const colorScheme = useColorScheme();
  const workspaceLayout = useWorkspaceLayout();

  const getMaxHeight = () => {
    if (!container.ref.current) return 0;
    const rect = container.ref.current!.getBoundingClientRect();
    const viewHeight = document.documentElement.clientHeight;
    const height = viewHeight - rect.top - (layout.view === "mobile" ? 60 : 0);
    return height - 16;
  };

  const maxHeight = getMaxHeight();

  useEffect(() => {
    gantt.scrollToDate(Date.now());
  }, []);

  return (
    <Fragment>
      <Group p={16}>
        <TaskMenuActions />
      </Group>

      <Stack px={16}>
        <Stack gap={0} style={{ position: "relative" }} ref={container.ref} className="Gantt">
          <Card
            h={maxHeight}
            style={{ overflow: "hidden" }}
            p={0}
            withBorder
            shadow="none"
            w="100%"
          >
            <LayoutSplit
              h={maxHeight}
              value={gantt.dividerPosition}
              onChange={(value) =>
                gantt.setState({
                  ...gantt.state,
                  dividerPosition: value,
                })
              }
            >
              {/* Sidebar */}
              <ScrollArea
                className="GantSideBarContent"
                viewportRef={gantt.sidebarRef}
                type="never"
                h="100%"
                style={{
                  borderRight: `1px solid ${workspaceLayout.dividerColor}`,
                  overflow: "auto",
                  position: "relative",
                  width: `${gantt.dividerPosition * 100}%`,
                }}
              >
                <Stack
                  gap={0}
                  align="stretch"
                  bg="var(--mantine-color-body)"
                  w="max-content"
                  style={{ minWidth: "100%" }}
                >
                  <SidebarHead />
                  <GanttTaskGroupByFolders position="sidebar" />
                </Stack>
              </ScrollArea>

              {/* Body */}
              <ScrollArea
                className="GantSideBody"
                viewportRef={gantt.contentBodyRef}
                bg={configs.backgroundColors[colorScheme]}
                type="always"
                h="100%"
                style={{
                  overflow: "auto",
                  position: "relative",
                  width: `${(1 - gantt.dividerPosition) * 100}%`,
                }}
              >
                <Stack
                  gap={0}
                  align="stretch"
                  className="bg-content"
                  w="max-content"
                  style={{ position: "relative", minHeight: maxHeight }}
                >
                  <BodyHead />
                  <GridColumns />
                  <GanttTaskGroupByFolders position="body" />
                </Stack>
              </ScrollArea>
            </LayoutSplit>
          </Card>

          {/* Zoom In / Out CTAs */}
          <Card
            shadow="md"
            p={0}
            radius={5}
            style={{
              position: "absolute",
              top: ganttConfig.headHeight + 16,
              right: 16,
              border: `1px solid ${workspaceLayout.dividerColor}`,
            }}
          >
            <Stack gap={0}>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius={0}
                onClick={() => gantt.changeColumnSize(gantt.state.columnSize + 20)}
                disabled={gantt.state.columnSize >= ganttConfig.maxColumnSize}
              >
                <IconPlus size={16} />
              </ActionIcon>

              <Divider />

              <ActionIcon
                variant="subtle"
                color="gray"
                radius={0}
                onClick={() => gantt.changeColumnSize(gantt.state.columnSize - 20)}
                disabled={gantt.state.columnSize <= ganttConfig.minColumnSize}
              >
                <IconMinus size={16} />
              </ActionIcon>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Fragment>
  );
};

export const TasksGanttView: FC<PropsWithChildren> = (props) => {
  return (
    <TasksDndProvider>
      <GanttProvider>
        <Content />
        {props.children}
      </GanttProvider>
    </TasksDndProvider>
  );
};
