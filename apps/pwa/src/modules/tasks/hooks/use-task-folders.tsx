"use client";

import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/queries/queryTags.graphql";
import { TagType } from "@/modules/tags/tags-types";
import { useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { getTaskView } from "../tasks-service";

export type TaskFolder = TagsQuery["tags"]["data"][number];

export const useTaskFolders = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { data, loading } = useQuery<TagsQuery, TagsQueryVariables>(QUERY_TAGS, {
    variables: { type: TagType.TASK_FOLDER },
  });

  const folders = Array.from(data?.tags.data ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const activatedFolder = folders.find((v) => v.slug === params.slug);

  const openFolder = (folder: TaskFolder) => {
    const view = getTaskView();
    const url = `/tasks/${view}/${folder.slug}`;
    router.push(url, { scroll: false });
  };

  const exitFolder = () => {
    const view = getTaskView();
    const url = `/tasks/${view}/d`;
    router.push(url, { scroll: false });
  };

  return {
    folders,
    activatedFolder,
    openFolder,
    exitFolder,
    loading,
  };
};
