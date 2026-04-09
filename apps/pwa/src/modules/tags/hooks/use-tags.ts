"use client";

import { EventDataActionType, EventType, TagType } from "@/graphql/enums.graphql";
import { TagInput, UpdateTagInput } from "@/graphql/types.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { AppEntity } from "@/types";
import { searchWithoutAccents } from "@/utils/string.utils";
import { useQuery } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { useCallback } from "react";
import BulkUpdateTagsDocument from "../graphql/bulkUpdateTags.graphql";
import CreateTagDocument from "../graphql/createTag.graphql";
import GetTagsDocument from "../graphql/getTags.graphql";
import RemoveTagDocument from "../graphql/removeTag.graphql";

export const useTags = (type?: TagType) => {
  const { t } = useLingui();
  const { data, loading, error, client, refetch } = useQuery(GetTagsDocument, {
    variables: {
      query: {
        type,
      },
    },
  });

  const tags = Array.from(data?.list.results ?? []).sort((a, b) => a.order - b.order);

  const create = async (input: TagInput) => {
    const data = await client.mutate({
      mutation: CreateTagDocument,
      variables: {
        input,
      },
    });
    if (!data.data?.tag) throw new Error(t`Action failed`);
    return data.data?.tag!;
  };

  const update = async (id: string, input: UpdateTagInput) => {
    const data = await client.mutate({
      mutation: BulkUpdateTagsDocument,
      variables: {
        items: [
          {
            ...input,
            _id: id,
          },
        ],
      },
    });
    if (!data.data?.tags[0]) throw new Error(t`Action failed`);
    return data.data?.tags[0];
  };

  const remove = async (id: string) => {
    await client.mutate({
      mutation: RemoveTagDocument,
      variables: {
        id,
      },
      awaitRefetchQueries: true,
    });
  };

  const reorder = async (items: { _id: string; order: number }[]) => {
    const reorderedTags = tags.map((t) => {
      const item = items.find((i) => i._id === t._id);
      if (item) return { ...t, order: item.order };
      return t;
    });

    await client.mutate({
      mutation: BulkUpdateTagsDocument,
      variables: {
        items: reorderedTags,
      },
    });
  };

  useEventsListener(
    [EventType.TagNew, EventType.TagsUpdated, EventType.TagsArchived],
    async (e) => {
      if (
        e.actionType === EventDataActionType.Archived ||
        e.actionType === EventDataActionType.Create
      ) {
        refetch();
      }

      if (e.actionType === EventDataActionType.Update) {
        await client.query({
          query: GetTagsDocument,
          variables: {
            ids: [
              e.data.ref,
              ...e.relatedEntities.filter((e) => e.entity === AppEntity.TAGS).map((e) => e.id),
            ],
          },
        });
      }
    },
  );

  const search = useCallback(
    (q: string) => {
      return tags.filter((tag) => searchWithoutAccents(q, tag.name));
    },
    [tags],
  );

  return {
    tags,
    loading,
    error,
    create,
    update,
    remove,
    reorder,
    search,
  };
};
