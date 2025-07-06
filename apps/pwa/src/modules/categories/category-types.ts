import { BaseMongoEntity } from "@/types";

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