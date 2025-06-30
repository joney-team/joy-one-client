import { BaseMongoEntity } from "@/types";
import { type JSONContent } from "@tiptap/react";
import { CategoryEntity } from "../categories/category-types";
import { ProductValue } from "../products/components/product-input";

export interface PostEntity extends BaseMongoEntity {
  title: string;
  slug: string;
  excerpt?: string;
  content: JSONContent;
  contentHtml?: string;
  thumbnail?: string;
  meta?: any;
  publishedAt?: number;
  categoryId?: string;
  category?: CategoryEntity;
  product?: ProductValue;
}
