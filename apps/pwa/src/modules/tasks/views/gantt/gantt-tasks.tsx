"use client";

import { LayoutSplit } from "@/components/layout-split";
import { ActionIcon, Card, Divider, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useTaskFolders } from "../../hooks/use-task-folders";
import { ganttConfig } from "./gantt-tasks-config";
import { useGantt } from "./gantt-tasks-context";
import { GanttTasksGroup } from "./gantt-tasks-group";
import { BodyHead, GridColumns, SidebarHead } from "./gantt-tasks-layout";
import { GanttProvider } from "./gantt-tasks-provider";

import { GanttRefsProvider, useGanttRefs } from "./gantt-tasks-refs";
import styles from "./gantt-tasks.module.css";
import { classNames } from "@/utils/ui.utils";

const Content: FC = () => {
  const ganttRefs = useGanttRefs();
  const gantt = useGantt();
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

  return (
    <Stack
      ref={ganttRefs.root}
      className={classNames(styles.GanttTasks, {
        [styles.isGrab]: gantt.isGrabbing,
      })}
      pos="relative"
      bg="var(--mantine-color-body)"
    >
      <LayoutSplit
        h={sized.height}
        value={gantt.dividerPosition}
        onChange={(value) =>
          gantt.setState({
            ...gantt.state,
            dividerPosition: value,
          })
        }
      >
        {/* Sidebar */}
        <Stack
          h={sized.height}
          style={{
            borderRight: `1px solid var(--app-divider-color)`,
            width: `${gantt.dividerPosition * 100}%`,
            overflow: "hidden",
          }}
        >
          <Stack gap={0} bg="var(--mantine-color-body)" id="GantSideBar">
            <Stack
              gap={0}
              className={styles.SidebarContainer}
              ref={ganttRefs.sidebarContainer}
              style={{
                overflow: "hidden",
                maxHeight: sized.height,
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
            width: `${(1 - gantt.dividerPosition) * 100}%`,
            height: sized.height,
            maxHeight: sized.height,
          }}
        >
          <BodyHead />

          <div ref={ganttRefs.body} className={styles.Body} style={{ position: "relative" }}>
            <GridColumns />
          </div>
        </Stack>
      </LayoutSplit>

      {/* Zoom In / Out CTAs */}
      {/* <Card
        shadow="md"
        p={0}
        radius={5}
        style={{
          position: "absolute",
          top: ganttConfig.headHeight + 16,
          right: 16,
          border: `1px solid var(--app-divider-color)`,
          zIndex: 10,
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
      </Card> */}
    </Stack>
  );
};

export const GanttTasks: FC<PropsWithChildren> = (props) => {
  return (
    <GanttRefsProvider>
      <GanttProvider>
        <Content />
        {props.children}
      </GanttProvider>
    </GanttRefsProvider>
  );
};
