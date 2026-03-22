"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { TagDataFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import BULK_UPDATE_TAGS_MUTATION, {
  type BulkUpdateTagsMutation,
  type BulkUpdateTagsMutationVariables,
} from "@/modules/tags/graphql/mutationBulkUpdateTags.graphql";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/graphql/queryTags.graphql";
import { TagType } from "@/modules/tags/tags-types";
import { onError } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { parseTaskPath } from "../tasks-route-helpers";
import {
  InternalEvent,
  onInternalEvent,
  useInternalEventsListener,
} from "@/hooks/use-internal-event";

export type TaskFolder = TagDataFragment;

export const useTaskFolders = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { data, loading, refetch, client } = useQuery<TagsQuery, TagsQueryVariables>(QUERY_TAGS, {
    variables: { type: TagType.TASK_FOLDER },
  });

  const folders = Array.from(data?.tags.results ?? []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const activatedFolder = folders.find((v) => v.slug === params.slug);

  const openFolder = (folder: TaskFolder) => {
    const { view } = parseTaskPath(location.pathname);
    const url = `/tasks/${view}/${folder.slug}`;
    router.push(url, { scroll: false });
  };

  const exitFolder = () => {
    const { view } = parseTaskPath(location.pathname);
    const url = `/tasks/${view}/d`;
    router.push(url, { scroll: false });
  };

  const [bulkUpdateTags] = useMutation<BulkUpdateTagsMutation, BulkUpdateTagsMutationVariables>(
    BULK_UPDATE_TAGS_MUTATION,
  );

  const onBulkUpdateTags = async (items: (Partial<TagDataFragment> & { _id: string })[]) => {
    try {
      client.cache.updateQuery<TagsQuery, TagsQueryVariables>(
        {
          query: QUERY_TAGS,
          variables: { type: TagType.TASK_FOLDER },
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tags: {
              ...prev.tags,
              results: prev.tags.results
                .map((v) => ({ ...v, ...(items.find((v2) => v2._id === v._id) ?? {}) }))
                .sort((a, b) => a.order - b.order),
            },
          };
        },
      );

      await bulkUpdateTags({
        variables: {
          items,
        },
      });
    } catch (error) {
      onError(error);
    }
  };

  useEventsListener([EventType.TagsArchived, EventType.TagsUpdated], () => {
    refetch();
  });

  useInternalEventsListener([InternalEvent.WORKSPACE_CHANGED], () => {
    refetch();
  });

  return {
    folders,
    activatedFolder,
    openFolder,
    exitFolder,
    loading,
    bulkUpdateTags: onBulkUpdateTags,
  };
};
