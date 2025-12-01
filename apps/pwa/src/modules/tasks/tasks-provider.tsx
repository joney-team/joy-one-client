"use client";

import { useRouter } from "@/hooks/use-router";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import {
  getTaskEntites,
  getTaskEntity,
  getTaskView,
  tasksEmitter,
} from "@/modules/tasks/tasks-service";
import { TaskEntity, TaskPriority, TasksContext } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StorageKey } from "@/types";
import { shiftSelect } from "@/utils/array.utils";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useLocalStorage } from "@mantine/hooks";
import { useParams, usePathname } from "next/navigation";
import { FC, PropsWithChildren, useMemo, useState } from "react";
import { getSessionId } from "../auth/auth-service";
import QUERY_TAG_BY_SLUG, {
  type TagBySlugQuery,
  type TagBySlugQueryVariables,
} from "../tags/queries/queryTagBySlug.graphql";
import { Context } from "./tasks-context";
import { TaskView } from "./views/types";
import { type TasksQueryVariables } from "./queries/queryTasks.graphql";

export interface TasksState {
  selectedView?: TaskView;
  variables?: TasksQueryVariables;
  showClosed?: boolean;

  // Remove
  assigneeUserIds?: string[];
  partnerIds?: string[];
  priority?: TaskPriority;
  tagIds?: string[];
}

export const TasksProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();

  const [state, setState] = useLocalStorage<TasksState>({
    key: StorageKey.TASKS_STATE,
    defaultValue: {},
  });

  const [selectedTaskIds, _setSelectedTaskIds] = useState<string[]>([]);

  const params = useParams<{ slug: string; code: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const { data: tagFolderData, networkStatus } = useQuery<TagBySlugQuery, TagBySlugQueryVariables>(
    QUERY_TAG_BY_SLUG,
    {
      skip: !params.slug || params.slug === "d" || !workspace.isAvailable,
      variables: { slug: params.slug },
    }
  );

  const activatedFolder = tagFolderData?.tagBySlug ?? null;

  const isFolderLoading =
    networkStatus !== NetworkStatus.ready && !!params.slug && params.slug !== "d";

  const views = Object.values(TaskView);

  const view = useMemo(() => getTaskView(pathname), [pathname, state.selectedView]);

  const setView = (selectedView: TaskView) => {
    setState((s) => ({ ...s, selectedView }));
    router.push(`/tasks/${selectedView}/${activatedFolder?.slug ?? "d"}`);
  };

  const open = (task: Pick<TaskEntity, "_id" | "code">) => {
    const url = `/tasks/${view}/${activatedFolder?.slug || "d"}/${task.code}`;
    router.push(url, {}, { scroll: false });
  };

  const openFolder: TasksContext["openFolder"] = (folder) => {
    const url = `/tasks/${view}/${folder.slug}`;
    router.push(url, {}, { scroll: false });
  };

  const removeSelectedTasks = (specificTaskIds?: string[]) => {
    _setSelectedTaskIds(
      specificTaskIds ? (s) => s.filter((v) => !specificTaskIds.includes(v)) : []
    );
  };

  const toggleSelectTask = (taskId: string, isShiftKey?: boolean) => {
    const pointedTask = getTaskEntity(taskId);
    if (!pointedTask) return;

    const allTasks = getTaskEntites();
    const _relatedTaskIds = allTasks
      .filter(
        (v) =>
          v._id === taskId ||
          (v.parentId === pointedTask.parentId &&
            v.status === pointedTask.status &&
            v.folderId === pointedTask.folderId)
      )
      .map((v) => v._id);
    const _selectedTaskIds = _relatedTaskIds.filter((v) => selectedTaskIds.includes(v));

    if (isShiftKey && _relatedTaskIds.some((v) => selectedTaskIds.includes(v))) {
      const output = shiftSelect(
        _relatedTaskIds,
        taskId,
        _selectedTaskIds,
        selectedTaskIds[selectedTaskIds.length - 1]
      );
      _setSelectedTaskIds((s) => [...new Set([...s, ...output])]);
    } else {
      _setSelectedTaskIds((v) =>
        v.includes(taskId) ? v.filter((v) => v !== taskId) : [...v, taskId]
      );
    }
  };

  useEventsListener(
    [EventType.TASKS_UPDATED, EventType.TASK_SYNCED],
    (ev) => {
      const sessionId = getSessionId();
      if (ev.sessionId !== sessionId) {
        const _tasks = ev.data.tasks as TaskEntity[];
        tasksEmitter.emit("update", _tasks);
      }
    },
    []
  );

  const contextValue = useMemo<TasksContext>(() => {
    return {
      views,
      view,
      setView,
      state,
      setState,
      activatedFolder,
      statuses: workspace.settings?.taskStatuses || [],
      open,
      openFolder,
      href: (task: Pick<TaskEntity, "_id" | "code">) =>
        `/tasks/${view}/${activatedFolder?.slug || "d"}/${task.code}`,
      taskCode: params.code,
      selectedTaskIds: selectedTaskIds.filter((v) => !!getTaskEntity(v)),
      toggleSelectTask,
      removeSelectedTasks,
      isReady: !isFolderLoading && workspace.isAvailable,
    };
  }, [view, state, activatedFolder, workspace.settings, open, openFolder, pathname]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default TasksProvider;
