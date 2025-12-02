"use client";

import { useLazyQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useLingui } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { gantt, NewTask } from "dhtmlx-gantt";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FC } from "react";
import { useTaskFolders } from "../../hooks/use-task-folders";
import { ModalCreateTask } from "../../modals/modal-create-task";
import { TaskDataFragment } from "../../queries/fragmentTask.graphql";
import TASKS_QUERY, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";
import { updateTaskPath } from "../../tasks-route-helpers";
import { TaskFormProps } from "../../components/form-task";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

import styles from "./gantt-tasks.module.css";

const GanttTasksContent = ({
  onCreateTask,
  onTaskClick,
}: {
  onCreateTask: (args?: TaskFormProps) => void;
  onTaskClick: (task: TaskDataFragment) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { i18n } = useLingui();
  const [isGanttLoading, setIsGanttLoading] = useState(true);
  const [sized, setSized] = useState({ width: 0, height: 0 });
  const { folders, loading: isFoldersLoading } = useTaskFolders();

  const [getTasks, { data, loading: isTasksLoading }] = useLazyQuery<
    TasksQuery,
    TasksQueryVariables
  >(TASKS_QUERY);

  useEffect(() => {
    getTasks({ variables: { all: true } });
  }, []);

  useEffect(() => {
    if (isGanttLoading || isTasksLoading || isFoldersLoading || !data) return;

    const groupFolders: NewTask[] = folders.map((folder) => ({
      id: folder._id,
      text: folder.name,
      parent: null,
    }));

    const tasks: NewTask[] = Array.from(data.tasks.data)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((task) => ({
        id: task._id,
        text: task.name,
        start_date: task.startDate ? DateTime.normalizeDate(task.startDate) : null,
        end_date: task.dueDate ? DateTime.normalizeDate(task.dueDate) : null,
        parent: task.parent?._id ?? task.folder?._id,
      }));

    gantt.parse({
      data: [...groupFolders, ...tasks],
    });
  }, [isGanttLoading, isTasksLoading, isFoldersLoading, data]);

  useEffect(() => {
    if (!isGanttLoading) return;

    gantt.attachEvent("onTaskClick", (id) => {
      const task = data?.tasks.data.find((task) => task._id === id);
      if (task) onTaskClick(task);
      return true;
    });

    gantt.attachEvent("onTaskDblClick", (id) => {
      const task = data?.tasks.data.find((task) => task._id === id);
      if (task) onTaskClick(task);
      return true;
    });

    gantt.attachEvent("onTaskRowClick", (id) => {
      const task = data?.tasks.data.find((task) => task._id === id);
      if (task) onTaskClick(task);
      return true;
    });
  }, [isGanttLoading, data]);

  useEffect(() => {
    const container = containerRef.current;
    const pageLayout = document.getElementById("LayoutPage");
    if (!container || !pageLayout) return;

    const calculateSize = () => {
      const rect = container.getBoundingClientRect();
      setSized({
        width: document.documentElement.clientWidth - rect.left,
        height: document.documentElement.clientHeight - rect.top,
      });
    };

    calculateSize();

    window.addEventListener("resize", calculateSize);
    pageLayout.style.height = "100dvh";

    // Styles

    // Config
    gantt.i18n.setLocale(i18n.locale);
    gantt.config.scales = [
      { unit: "month", format: "%F, %Y" },
      { unit: "day", step: 1, format: "%j, %D" },
    ];

    gantt.init(container);

    container.style.setProperty(
      "--dhx-gantt-default-border",
      "1px solid var(--mantine-color-disabled)"
    );
    setIsGanttLoading(false);

    return () => {
      window.removeEventListener("resize", calculateSize);
      pageLayout.style.removeProperty("height");
    };
  }, [containerRef.current]);

  // Handle change locale
  useEffect(() => {
    if (isGanttLoading) return;
    gantt.i18n.setLocale(i18n.locale);
    gantt.render();
  }, [i18n.locale]);

  return (
    <Stack
      ref={containerRef}
      className={styles.GanttTasks}
      style={{ width: sized.width, height: sized.height, position: "relative", overflow: "scroll" }}
    />
  );
};

export const GanttTasks: FC = () => {
  const router = useRouter();

  return (
    <ModalCreateTask>
      {(openCreateTask) => {
        return (
          <GanttTasksContent
            onCreateTask={openCreateTask}
            onTaskClick={(task) => {
              router.push(updateTaskPath(location.pathname, { code: task.code }));
            }}
          />
        );
      }}
    </ModalCreateTask>
  );
};
