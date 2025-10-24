import { wait } from "@/utils/common.utils";
import { useLayout } from "@/layout/layout-context";
import { useTasks } from "@/modules/tasks/tasks-context";
import { onTasksUpdated } from "@/modules/tasks/hooks/use-task";
import { getTasks, syncTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { DateTime } from "@/utils/date-time.utils";
import { useList } from "@/components/list/use-list";
import { useForceUpdate, useThrottledCallback } from "@mantine/hooks";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { ganttConfig } from "./gantt.config";
import { Context } from "./gantt.context";
import type {
  GanttFolderState,
  GanttFolderStates,
  GanttLayout,
  GanttState,
  GanttTaskState,
  GanttTaskStates,
  Pointer,
  ScrollDirection,
  ScrollToDateArgs,
  UseGantt,
} from "./gantt.types";
import { getDatesFromRange } from "./gantt.utils";

let scrollTop = -1;
const oneDate = 24 * 60 * 60 * 1000;

export const GanttProvider: FC<PropsWithChildren> = (props) => {
  const layout = useLayout();
  const { state, tagFolder, statuses, tagFolders } = useTasks();

  const [isInitialized, setIsInitialized] = useState(false);
  const [_state, _setState] = useState<GanttState>({} as GanttState);
  const dates = getDatesFromRange(_state.fromDate, _state.toDate);

  const tasksState = useRef<GanttTaskStates>({});
  const foldersState = useRef<GanttFolderStates>({});

  const forceUpdate = useForceUpdate();

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const activeLayout = useRef<GanttLayout | null>(null);

  const columnResizing = useRef(false);

  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [sidebarContentWidth, setSidebarContentWidth] = useState(200);
  const [sidebarContentScrollPosition, setSidebarContentScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection | null>(null);

  const setActiveLayout = (layout?: GanttLayout) => {
    activeLayout.current = layout || null;
    forceUpdate();
  };

  const taskList = useList({
    autoFetch: false,
    id: "gantt-tasks",
    fetch: (q) =>
      getTasks({
        ...q,
        getAll: true,
      }),
  });

  const tasks = taskList.data.sort((a, b) => a.order - b.order);

  const onExtendTimeRange = useThrottledCallback(async () => {
    if (columnResizing.current) return;

    const contentBody = bodyRef.current!;
    columnResizing.current = true;

    const offset = 100;

    // Detect scroll to the end of left or right
    const isEndLeft = contentBody.scrollLeft <= 0 + offset;
    const isEndRight =
      contentBody.scrollLeft >= contentBody.scrollWidth - contentBody.clientWidth - offset;

    if (isEndLeft || isEndRight) {
      if (isEndLeft) {
        _setState((s) => {
          return {
            ...s,
            fromDate: new Date(s.fromDate.getTime() - oneDate * ganttConfig.rangeDates),
          };
        });

        await wait(100);
        const distance = ganttConfig.rangeDates * _state.columnSize;
        contentBody.scrollLeft = distance;
      }

      if (isEndRight) {
        _setState((s) => {
          return {
            ...s,
            toDate: new Date(s.toDate.getTime() + oneDate * ganttConfig.rangeDates),
          };
        });
      }

      await wait(500);
    }

    columnResizing.current = false;
  }, 500);

  const initialize = () => {
    const now = Date.now();

    let fromDate = now - oneDate * ganttConfig.rangeDates;
    let toDate = now + oneDate * ganttConfig.rangeDates;

    const lastedTask = tasks.reduce((acc, task) => {
      if (!acc && task.dueDate) return task;
      if (acc && task.dueDate && acc.dueDate && task.dueDate > acc.dueDate) return task;
      return acc;
    }, undefined as TaskEntity | undefined);

    if (lastedTask && lastedTask.dueDate && lastedTask.dueDate > DateTime.timeToSeconds(now)) {
      toDate = lastedTask.dueDate * 1000 + oneDate * ganttConfig.rangeDates;
    }

    const oldedTask = tasks.reduce((acc, task) => {
      if (!acc && task.dueDate) return task;
      if (acc && task.dueDate && acc.dueDate && task.dueDate < acc.dueDate) return task;
      return acc;
    }, {} as TaskEntity | undefined);

    if (oldedTask && oldedTask.dueDate && oldedTask.dueDate < DateTime.timeToSeconds(now)) {
      fromDate = oldedTask.dueDate * 1000 - oneDate * ganttConfig.rangeDates;
    }

    _setState({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      columnSize: 100,
    });

    setIsInitialized(true);
  };

  const resetTaskHovered = () => {
    tasksState.current = Object.keys(tasksState.current || ({} as GanttTaskStates)).reduce(
      (out, s) => {
        out[s] = { ...tasksState.current[s], hovered: false };
        return out;
      },
      {} as GanttTaskStates
    );
  };

  const toggleSisplayTaskStatusColor = () => {
    _setState((s) => ({ ...s, displayTaskStatusColor: !s.displayTaskStatusColor }));
  };

  const changeColumnSize = (size: number) => {
    _setState((s) => ({ ...s, columnSize: size }));
  };

  const setTaskState = (taskId: string, state?: GanttTaskState) => {
    if (state) {
      resetTaskHovered();
      tasksState.current[taskId] = state;
    } else {
      delete tasksState.current[taskId];
    }

    if (scrollDirection === "vertical") return;
    forceUpdate();
  };

  const setFolderState = (folderId: string, state?: GanttFolderState) => {
    if (state) {
      foldersState.current[folderId] = state;
    } else {
      delete foldersState.current[folderId];
    }

    if (scrollDirection === "vertical") return;
    forceUpdate();
  };

  const scrollToDate: ScrollToDateArgs = (args) => {
    const date = typeof args === "number" ? args : (args as { date: Date | number }).date;
    const offset =
      typeof args === "number"
        ? -_state.columnSize * 0.8
        : (args as { offset?: number }).offset || -_state.columnSize * 0.8;
    const behavior =
      typeof args === "number"
        ? "instant"
        : (args as { behavior?: "smooth" | "instant" }).behavior || "smooth";

    const _date = new Date(date);
    _date.setHours(0, 0, 0, 0);

    const indexOfDate = dates.findIndex((d) => d.getTime() === _date.getTime());
    if (indexOfDate === -1) return;

    const x = indexOfDate * _state.columnSize;
    const _offset = typeof offset === "number" ? offset : -_state.columnSize / 4;

    const contentBody = bodyRef.current!;
    const scrollLeft = x + _offset;

    if (behavior === "smooth") {
      contentBody.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    } else {
      contentBody.scrollLeft = scrollLeft;
    }
  };

  useEffect(() => {
    taskList.fetch(true, {
      isSilient: true,
      addonQuery: {
        statusNotIn: state.showClosed ? undefined : [DefaultTaskStatusId.CLOSED],
        tagFolderId: tagFolder?._id,
        parentId: "root",
      },
    });
  }, [state, tagFolder?._id]);

  useEffect(() => {
    if (!isInitialized && taskList.isInitialized) initialize();
  }, [isInitialized, taskList.isInitialized]);

  onTasksUpdated(
    (updatedTasks) => {
      const synced = syncTasks({
        prevTasks: tasks,
        updatedTasks,
        related: (task) => !!!task.parentId,
      });

      if (synced.isChanged) {
        taskList.setData(synced.changed, taskList.count + synced.balance);
      }
    },
    [tasks]
  );

  useEffect(() => {
    if (isInitialized) {
      setTimeout(() => {
        const sidebar = sidebarRef.current!;
        const body = bodyRef.current!;

        if (isInitialized && sidebar && body) {
          const onScroll = (pointer: Pointer) => {
            return (ev: Event) => {
              const scrollDirection: ScrollDirection =
                scrollTop !== (ev.target as HTMLElement).scrollTop ? "vertical" : "horizontal";
              scrollTop = (ev.target as HTMLElement).scrollTop;

              if (pointer === "body" && scrollDirection === "vertical") {
                sidebar.scrollTop = scrollTop;
              }

              if (pointer === "body" && scrollDirection === "horizontal") {
                onExtendTimeRange();
              }

              if (pointer === "sidebar" && scrollDirection === "vertical") {
                body.scrollTop = scrollTop;
              }

              if (pointer === "sidebar" && scrollDirection === "horizontal") {
                setSidebarContentScrollPosition(sidebar.scrollLeft);
              }

              setScrollDirection(scrollDirection);
            };
          };

          const sidebarOnScroll = onScroll("sidebar");
          sidebar.addEventListener("scroll", sidebarOnScroll);

          const bodyOnScroll = onScroll("body");
          body.addEventListener("scroll", bodyOnScroll);

          return () => {
            sidebar.removeEventListener("scroll", sidebarOnScroll);
            body.removeEventListener("scroll", bodyOnScroll);
          };
        }
      }, 100);
    }
  }, [isInitialized]);

  const contextValue: UseGantt = {
    state: _state,
    setState: (s: GanttState) => _setState(s),
    dividerPosition:
      typeof _state.dividerPosition === "number"
        ? _state.dividerPosition
        : layout.view === "mobile"
        ? 0.5
        : 0.3,
    activeLayout: activeLayout.current,
    setActiveLayout,
    dates,
    sidebarContentScrollPosition,
    setSidebarContentScrollPosition,
    sidebarContentWidth,
    setSidebarContentWidth,
    tagFolders,
    activatedTagFolder: tagFolder,
    tasks,
    sidebarWidth,
    setSidebarWidth,
    tasksState: tasksState.current,
    setTaskState,
    foldersState: foldersState.current,
    setFolderState,
    sidebarRef,
    contentBodyRef: bodyRef,
    changeColumnSize,
    scrollToDate,
    toggleSisplayTaskStatusColor,
    statuses,
    scrollDirection,
    isScrolling: scrollDirection !== null,
  };

  return (
    <Context.Provider value={contextValue}>
      {isInitialized ? props.children : null}
    </Context.Provider>
  );
};
