import { createContext, useContext } from "react";

import { TagInput } from "@/graphql/types.graphql";
import { TagFragment } from "./graphql/fragmentTag.graphql";

export interface TagsContext {
  isInitialized: boolean;
  list: TagFragment[];
  create: (dto: TagInput) => Promise<TagFragment>;
  update: (id: string, dto: TagInput) => Promise<TagFragment>;
  remove: (id: string) => Promise<void>;
  search: (q: string) => TagFragment[];
  reorder: (items: { _id: string; order: number }[]) => Promise<void>;
}

export const Context = createContext({} as TagsContext);
export const useTags = () => useContext(Context);
