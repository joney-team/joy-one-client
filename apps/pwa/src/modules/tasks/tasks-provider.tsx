"use client";

import { useRouter } from "@/hooks/use-router";
import { TasksContext } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StorageKey } from "@/constants/storage-key";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useLocalStorage } from "@mantine/hooks";
import { useParams, usePathname } from "next/navigation";
import { FC, PropsWithChildren, useMemo } from "react";
import QUERY_TAG_BY_SLUG, {
  type TagBySlugQuery,
  type TagBySlugQueryVariables,
} from "../tags/graphql/queryTagBySlug.graphql";
import { type TasksQueryVariables } from "./graphql/queryTasks.graphql";
import { Context } from "./tasks-context";
import { parseTaskPath } from "./tasks-route-helpers";
import { TaskView } from "./views/types";

export interface TasksState {
  selectedView?: TaskView;
  variables?: TasksQueryVariables;
  showClosed?: boolean;
}

const views = Object.values(TaskView);

export const TasksProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();

  const [state, setState] = useLocalStorage<TasksState>({
    key: StorageKey.TASKS_STATE,
    defaultValue: {},
  });

  const params = useParams<{ slug: string; code: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const { data: folderData, networkStatus } = useQuery<TagBySlugQuery, TagBySlugQueryVariables>(
    QUERY_TAG_BY_SLUG,
    {
      skip: !params.slug || params.slug === "d" || !workspace.isAvailable,
      variables: { slug: params.slug },
    }
  );

  const activatedFolder = folderData?.tagBySlug ?? null;

  const isFolderLoading =
    networkStatus !== NetworkStatus.ready && !!params.slug && params.slug !== "d";

  const { view } = useMemo(() => parseTaskPath(pathname), [pathname]);

  const setView = (selectedView: TaskView) => {
    setState((s) => ({ ...s, selectedView }));
    router.push(`/tasks/${selectedView}/${activatedFolder?.slug ?? "d"}`);
  };

  const contextValue = useMemo<TasksContext>(() => {
    return {
      views,
      view,
      setView,
      state,
      setState,
      activatedFolder,
      isReady: !isFolderLoading && workspace.isAvailable,
    };
  }, [view, state, activatedFolder, workspace.isAvailable, isFolderLoading]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default TasksProvider;
