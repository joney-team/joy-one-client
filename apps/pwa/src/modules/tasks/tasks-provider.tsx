"use client";

import { useRouter } from "@/hooks/use-router";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { getTaskEntites, getTaskEntity, tasksEmitter } from "@/modules/tasks/tasks-service";
import { TaskEntity, TaskPriority } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { shiftSelect } from "@/utils/array.utils";
import { useParams } from "next/navigation";
import { Dispatch, FC, PropsWithChildren, SetStateAction, useEffect, useState } from "react";
import { getSessionId } from "../auth/auth-service";
import { Context } from "./tasks-context";
import { TaskView } from "./views/types";

export interface TasksState {
  showClosed?: boolean;
  assigneeUserIds?: string[];
  partnerIds?: string[];
  priority?: TaskPriority;
  tagIds?: string[];
}

export const TasksProvider: FC<PropsWithChildren> = (props) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const [_view, _setView] = useState<TaskView>(TaskView.BOARD);
  const [state, _setState] = useState<TasksState>({});
  const [selectedTaskIds, _setSelectedTaskIds] = useState<string[]>([]);

  const tags = useTags();
  const workspace = useWorkspace();
  const params = useParams();
  const router = useRouter();

  const tagFolderSlug = params.slug;
  const tagFolder = tags.list.find((v) => v.slug === tagFolderSlug);

  const taskCode = params.code as string;

  const views = Object.values(TaskView);

  const viewFromPathname = router.pathname.split("/")[2] as TaskView;
  const view = Object.values(TaskView).includes(viewFromPathname) ? viewFromPathname : TaskView.LIST;

  const setView = (view: TaskView) => {
    localStorage.setItem("tasks_view", view);
    router.push(`/tasks/${view}/${tagFolder?.slug || "d"}`);
  };

  const setState: Dispatch<SetStateAction<TasksState>> = (fn) => {
    _setState((s) => {
      const newState = typeof fn === "function" ? fn(s) : fn;
      localStorage.setItem("tasks_state", JSON.stringify(newState));
      return newState;
    });
  };

  const initialize = async () => {
    const cachedView = localStorage.getItem("tasks_view") as TaskView;
    if (views.includes(cachedView)) _setView(cachedView);

    let _state = {};

    const cachedState = localStorage.getItem("tasks_state");
    if (cachedState) {
      try {
        _state = JSON.parse(cachedState);
      } catch (error) {
        console.error(error);
      }
    }

    _setState(_state);
    setIsInitialized(true);
  };

  const getSelectedView = () => {
    const defaultViewCached = localStorage.getItem("tasks_view") as TaskView;
    if (defaultViewCached && Object.values(TaskView).includes(defaultViewCached)) {
      return defaultViewCached;
    }

    return TaskView.LIST;
  };

  const redirectToDefaultView = () => {
    const defaultViewCached = localStorage.getItem("tasks_view") as TaskView;
    if (defaultViewCached && Object.values(TaskView).includes(defaultViewCached)) {
      router.replace(`/tasks/${defaultViewCached}`);
    } else {
      router.replace(`/tasks/${TaskView.LIST}`);
    }
  };

  const open = (task: TaskEntity) => {
    const url = `/tasks/${view}/${tagFolder?.slug || "d"}/${task.code}`;
    router.push(url, {}, { scroll: false });
  };

  const openFolder = (tagFolder: TagEntity) => {
    const url = `/tasks/${view}/${tagFolder.slug}`;
    router.push(url, {}, { scroll: false });
  };

  const removeFolder = () => {
    const url = `/tasks/${view}`;
    router.push(url, {}, { scroll: false });
  };

  const removeSelectedTasks = (specificTaskIds?: string[]) => {
    _setSelectedTaskIds(specificTaskIds ? (s) => s.filter((v) => !specificTaskIds.includes(v)) : []);
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
            v.tagFolderId === pointedTask.tagFolderId)
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
      _setSelectedTaskIds((v) => (v.includes(taskId) ? v.filter((v) => v !== taskId) : [...v, taskId]));
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

  useEffect(() => {
    if (workspace.isInitialized) initialize();
  }, [workspace.isInitialized]);

  return (
    <Context.Provider
      value={{
        views,
        view,
        setView,
        state,
        setState,
        tagFolder,
        isInitialized,
        tagFolders: tags.list.filter((v) => v.type === TagType.TASK_FOLDER),
        statuses: workspace.settings?.taskStatuses || [],
        open,
        openFolder,
        redirectToDefaultView,
        viewFromPathname,
        taskCode,
        router,
        params,
        getSelectedView,
        removeFolder,
        selectedTaskIds: selectedTaskIds.filter((v) => !!getTaskEntity(v)),
        toggleSelectTask,
        removeSelectedTasks,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default TasksProvider;
