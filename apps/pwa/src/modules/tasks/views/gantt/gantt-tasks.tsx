"use client";

import { LayoutSplit } from "@/components/layout-split";
import { Group, Stack } from "@mantine/core";
import { FC, Fragment, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useTaskFolders } from "../../hooks/use-task-folders";
import { ganttConfig } from "./gantt-tasks-config";
import { useGantt } from "./gantt-tasks-context";
import { GanttProvider } from "./gantt-tasks-provider";

import { nonLoading } from "@/utils/non-loading";
import { classNames } from "@/utils/ui.utils";
import dynamic from "next/dynamic";
import { TaskSelectionsProvider } from "../../modules/task-selections/task-selections-provider";
import { GanttRefsProvider, useGanttRefs } from "./gantt-tasks-refs";
import styles from "./gantt-tasks.module.css";
import { useLayout } from "@/layout/layout-context";

const SidebarHead = dynamic(() => import("./gantt-tasks-layout").then((mod) => mod.SidebarHead), {
  ssr: false,
  loading: nonLoading,
});

const BodyHead = dynamic(() => import("./gantt-tasks-layout").then((mod) => mod.BodyHead), {
  ssr: false,
  loading: nonLoading,
});

const GridColumns = dynamic(() => import("./gantt-tasks-layout").then((mod) => mod.GridColumns), {
  ssr: false,
  loading: nonLoading,
});

const GanttTasksGroup = dynamic(
  () => import("./gantt-tasks-group").then((mod) => mod.GanttTasksGroup),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const GanttTasksVerticalScrollbar = dynamic(
  () =>
    import("./scrollbar/gantt-tasks-vertical-scrollbar").then(
      (mod) => mod.GanttTasksVerticalScrollbar
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const GanttTasksHorizontalScrollbar = dynamic(
  () =>
    import("./scrollbar/gantt-tasks-horizontal-scrollbar").then(
      (mod) => mod.GanttTasksHorizontalScrollbar
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const Content: FC = () => {
  const ganttRefs = useGanttRefs();
  const gantt = useGantt();
  const layout = useLayout();
  const { activatedFolder, folders } = useTaskFolders();
  const [sized, setSized] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateContainerSize = () => {
      if (!ganttRefs.root.current) return;
      const rect = ganttRefs.root.current!.getBoundingClientRect();

      setSized({
        width: document.documentElement.clientWidth - rect.left,
        height: document.documentElement.clientHeight - rect.top,
      });
    };

    calculateContainerSize();

    window.addEventListener("resize", calculateContainerSize);

    return () => {
      window.removeEventListener("resize", calculateContainerSize);
    };
  }, [ganttRefs.root.current]);

  const sidebar = useMemo(() => {
    if (activatedFolder) {
      return <GanttTasksGroup folder={activatedFolder} isDefaultOpen />;
    }

    if (folders.length === 0) {
      return <GanttTasksGroup pure isDefaultOpen />;
    }

    return (
      <Fragment>
        <GanttTasksGroup isDefaultOpen />

        {folders.map((folder) => (
          <GanttTasksGroup key={folder._id} folder={folder} />
        ))}
      </Fragment>
    );
  }, [activatedFolder, folders]);

  const contentSized = useMemo(() => {
    return {
      width: sized.width - ganttConfig.scrollbarSize.vertical,
      height: sized.height - ganttConfig.scrollbarSize.horizontal,
    };
  }, [sized]);

  const dividerPosition = useMemo(() => {
    return typeof gantt.state.dividerPosition === "number"
      ? gantt.state.dividerPosition
      : layout.view === "mobile"
      ? 0.5
      : 0.3;
  }, [gantt.state.dividerPosition]);

  return (
    <Stack
      ref={ganttRefs.root}
      className={classNames(styles.GanttTasks, {
        [styles.isGrab]: gantt.isGrabbing,
      })}
      pos="relative"
      bg="var(--mantine-color-body)"
      gap={0}
    >
      <Group gap={0} w={sized.width} h={sized.height} style={{ overflow: "hidden" }}>
        <Stack gap={0}>
          <LayoutSplit
            h={contentSized.height}
            w={contentSized.width}
            value={dividerPosition}
            onChange={(value) =>
              gantt.setState({
                ...gantt.state,
                dividerPosition: value,
              })
            }
          >
            {/* Sidebar */}
            <Stack
              h={contentSized.height}
              style={{
                borderRight: `1px solid var(--app-divider-color)`,
                width: `${dividerPosition * 100}%`,
                overflow: "hidden",
                transition: "width 0.2s ease-out",
              }}
            >
              <Stack gap={0} bg="var(--mantine-color-body)" id="GantSideBar">
                <Stack
                  gap={0}
                  className={styles.SidebarContainer}
                  ref={ganttRefs.sidebarContainer}
                  style={{
                    overflow: "hidden",
                    maxHeight: contentSized.height,
                  }}
                >
                  <SidebarHead />
                  {sidebar}
                </Stack>
              </Stack>
            </Stack>

            {/* Body */}
            <Stack
              gap={0}
              pos="relative"
              ref={ganttRefs.bodyContainer}
              className={styles.BodyContainer}
              align="stretch"
              style={{
                overflow: "hidden",
                width: `${(1 - dividerPosition) * 100}%`,
                height: contentSized.height,
                maxHeight: contentSized.height,
                transition: "width 0.2s ease-out",
              }}
            >
              <BodyHead />

              <div ref={ganttRefs.body} className={styles.Body} style={{ position: "relative" }}>
                <GridColumns />
              </div>
            </Stack>
          </LayoutSplit>
          <GanttTasksHorizontalScrollbar />
        </Stack>
        <GanttTasksVerticalScrollbar />
      </Group>
    </Stack>
  );
};

export const GanttTasks: FC<PropsWithChildren> = (props) => {
  return (
    <GanttRefsProvider>
      <GanttProvider>
        <TaskSelectionsProvider>
          <Content />
        </TaskSelectionsProvider>

        {props.children}
      </GanttProvider>
    </GanttRefsProvider>
  );
};
