import { BaseMongoEntity } from "@/types";
import { CustomFieldValue } from "../custom-fields/custom-field-types";

export enum CategoryType {
  COMMON = 'COMMON',
  PRODUCTS = 'PRODUCTS',
  POSTS = 'POSTS',
}

export interface CategoryDto {
  name: string;
  type?: CategoryType;
  slug?: string;
  icon?: string;
  thumbnail?: string;
  description?: string;
  parentId?: string;
  order?: number;
  customFieldValues?: CustomFieldValue[];
}

export interface CategorySortItemDto {
  id: string;
  order: number;
}

export interface CategorySortDto {
  items: CategorySortItemDto[];
}

export interface GenerateSlugDto {
  name: string;
}

export interface CategoryEntity extends BaseMongoEntity {
  name: string;
  slug: string;
  icon?: string;
  thumbnail?: string;
  description?: string;
  parentId?: string;
  order: number;
  type: CategoryType;
}