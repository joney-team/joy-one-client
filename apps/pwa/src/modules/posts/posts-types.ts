import { BaseMongoEntity } from "@/types";
import { type JSONContent } from "@tiptap/react";
import { CategoryEntity } from "../categories/category-types";

export interface PostEntity extends BaseMongoEntity {
  title: string;
  slug: string;
  excerpt?: string;
  content: JSONContent;
  contentHTML?: string;
  thumbnail?: string;
  meta?: any;
  publishedAt?: number;
  categoryId?: string;
  category?: CategoryEntity;
}
