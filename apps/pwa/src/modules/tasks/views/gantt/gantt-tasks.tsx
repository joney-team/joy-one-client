"use client";

import { Stack } from "@mantine/core";
import { useEffect, useRef, useState, type FC } from "react";

import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { useTaskFolders } from "../../hooks/use-task-folders";
import QUERY_TASKS, {
  type TasksQueryVariables,
  type TasksQuery,
} from "../../queries/queryTasks.graphql";
import styles from "./gantt-tasks.module.css";
import { List } from "react-window";

export const GanttTasks: FC = () => {
  const client = useApolloClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const { folders, loading: isFoldersLoading } = useTaskFolders();

  useEffect(() => {
    if (containerRef.current) {
      const sized = containerRef.current.getBoundingClientRect();
      const width = document.documentElement.clientWidth - sized.left;
      const height = document.documentElement.clientHeight - sized.top;
      setContainerSize({ width, height });
      setIsInitialized(true);
    }
  }, [containerRef]);

  return (
    <Stack
      ref={containerRef}
      style={{ ...containerSize, overflow: "auto", position: "relative" }}
      bg="var(--mantine-primary-color-contrast)"
      className={styles.GanttTasks}
    >
      <Stack className=""></Stack>
    </Stack>
  );
};
