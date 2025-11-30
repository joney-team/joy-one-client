import { BaseMongoEntity } from "@/types";

export enum TagType {
  CUSTOMER = "CUSTOMER",
  MESSAGE_BOX = "MESSAGE_BOX",
  TASK_FOLDER = "TASK_FOLDER",
  TASK = "TASK",
}

export interface TagDto {
  name: string;
  color?: string | null;
  order?: number;
  type: TagType;
}

export interface TagEntity extends BaseMongoEntity {
  __typename: "TagEntity";
  name: string;
  slug: string;
  color: string | null;
  workspaceId: string;
  type: TagType;
  order?: number | null;
}

export interface ReorderTag {
  _id: string;
  order: number;
}

export interface ReorderTagsDto {
  items: ReorderTag[];
}
