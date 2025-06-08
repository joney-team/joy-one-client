import { createContext, useContext } from "react";

import { ReorderTag, TagDto } from "./tags-types";

import { TagEntity } from "./tags-types";

export interface TagsContext {
  list: TagEntity[];
  create: (dto: TagDto) => Promise<TagEntity>;
  update: (id: string, dto: TagDto) => Promise<TagEntity>;
  remove: (id: string) => Promise<void>;
  search: (q: string) => TagEntity[];
  reorder: (items: ReorderTag[]) => Promise<void>;
}

export const Context = createContext({} as TagsContext);
export const useTags = () => useContext(Context);
