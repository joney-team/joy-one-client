"use client";

import { EventType, TagType } from "@/graphql/enums.graphql";
import { InternalEvent, useInternalEventsListener } from "@/hooks/use-internal-event";
import { useEventsListener } from "@/modules/events/event-service";
import BulkUpdateTagsDocument from "@/modules/tags/graphql/bulkUpdateTags.graphql";
import { TagFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import GetTagsDocument from "@/modules/tags/graphql/getTags.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { parseTaskPath } from "../tasks-route-helpers";

export type TaskFolder = TagFragment;

export const useTaskFolders = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { data, loading, refetch, client } = useQuery(GetTagsDocument, {
    variables: { query: { type: TagType.TaskFolder } },
  });

  const folders = Array.from(data?.list.results ?? []).sort(
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

  const [bulkUpdateTags] = useMutation(BulkUpdateTagsDocument);

  const onBulkUpdateTags = async (items: (Partial<TagFragment> & { _id: string })[]) => {
    try {
      client.cache.updateQuery(
        {
          query: GetTagsDocument,
          variables: { query: { type: TagType.TaskFolder } },
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            list: {
              ...prev.list,
              results: prev.list.results
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
