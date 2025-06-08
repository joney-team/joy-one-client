import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { searchWithoutAccents } from "@/utils/string.utils";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { Context, TagsContext } from "./tags-context";
import { createTag, getTags, removeTag, reorderTags, updateTag } from "./tags-service";
import { ReorderTag, TagEntity } from "./tags-types";

const TagsProvider: FC<PropsWithChildren> = (props) => {
  const [tags, setTags] = useState<TagEntity[]>([]);
  const workspace = useWorkspace();

  const fetch = async () => {
    try {
      const response = await getTags();
      setTags(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const contextValue: TagsContext = {
    list: tags,
    create: async (dto) => {
      const data = await createTag(dto);
      setTags([...tags, data]);
      return data;
    },
    update: async (id, dto) => {
      const data = await updateTag(id, dto);
      setTags(tags.map((tag) => (tag._id === id ? data : tag)));
      return data;
    },
    remove: async (id) => {
      await removeTag(id);
      setTags(tags.filter((tag) => tag._id !== id));
    },
    search: (q: string) => tags.filter((tag) => searchWithoutAccents(q, tag.name)),
    reorder: async (items: ReorderTag[]) => {
      setTags((s) =>
        s.map((t) => {
          const item = items.find((i) => i._id === t._id);
          if (item) return { ...t, order: item.order };
          return t;
        })
      );
      await reorderTags({ items });
    },
  };

  useEventsListener([EventType.SYNC_TAGS], () => {
    fetch();
  });

  useEffect(() => {
    if (workspace.userMember?.userId) fetch();
  }, [workspace.userMember?.userId]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default TagsProvider;
