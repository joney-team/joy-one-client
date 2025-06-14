import { BaseMongoEntity } from "@/types";
import { type JSONContent } from "@tiptap/react";

export interface PostEntity extends BaseMongoEntity {
  title: string;
  slug: string;
  excerpt?: string;
  content: JSONContent;
  thumbnail?: string;
  meta?: any;
  publishedAt?: number;
  categoryId?: string;
}
