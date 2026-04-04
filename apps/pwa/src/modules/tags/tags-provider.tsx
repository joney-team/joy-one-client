"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { searchWithoutAccents } from "@/utils/string.utils";
import { useApolloClient } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useEventsListener } from "../events/event-service";
import BulkUpdateTagsDocument from "./graphql/bulkUpdateTags.graphql";
import CreateTagDocument from "./graphql/createTag.graphql";
import { TagFragment } from "./graphql/fragmentTag.graphql";
import GetTagsDocument from "./graphql/getTags.graphql";
import RemoveTagDocument from "./graphql/removeTag.graphql";
import { Context, TagsContext } from "./tags-context";

const TagsProvider: FC<PropsWithChildren> = (props) => {
  const client = useApolloClient();
  const [tags, setTags] = useState<TagFragment[]>([]);
  const workspace = useWorkspace();
  const [isInitialized, setIsInitialized] = useState(false);

  const fetch = async () => {
    try {
      const response = await client.query({
        query: GetTagsDocument,
      });
      setTags(response.data?.list.results ?? []);
      setIsInitialized(true);
    } catch (error) {
      console.error(error);
    }
  };

  const contextValue: TagsContext = {
    list: tags,
    isInitialized,
    create: async (input) => {
      const data = await client.mutate({
        mutation: CreateTagDocument,
        variables: {
          input,
        },
      });
      if (!data.data?.tag) throw new Error(t`Action failed`);
      setTags([...tags, data.data?.tag!]);
      return data.data.tag;
    },
    update: async (id, dto) => {
      const data = await client.mutate({
        mutation: BulkUpdateTagsDocument,
        variables: {
          items: [
            {
              _id: id,
              ...dto,
            },
          ],
        },
      });
      if (!data.data?.tags[0]) throw new Error(t`Action failed`);
      setTags(tags.map((tag) => (tag._id === id ? data.data?.tags[0]! : tag)));
      return data.data.tags[0];
    },
    remove: async (id) => {
      await client.mutate({
        mutation: RemoveTagDocument,
        variables: {
          id,
        },
      });
      setTags(tags.filter((tag) => tag._id !== id));
    },
    search: (q: string) => tags.filter((tag) => searchWithoutAccents(q, tag.name)),
    reorder: async (items: { _id: string; order: number }[]) => {
      const reorderedTags = tags.map((t) => {
        const item = items.find((i) => i._id === t._id);
        if (item) return { ...t, order: item.order };
        return t;
      });

      setTags(reorderedTags);

      await client.mutate({
        mutation: BulkUpdateTagsDocument,
        variables: {
          items: reorderedTags,
        },
      });
    },
  };

  useEventsListener([EventType.TagNew, EventType.TagsUpdated, EventType.TagsArchived], () => {
    fetch();
  });

  useEffect(() => {
    if (workspace.member?.workspaceId) fetch();
  }, [workspace.member?.workspaceId]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default TagsProvider;
