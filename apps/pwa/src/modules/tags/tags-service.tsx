"use client";

import { AppPageMetadata, ResponseList } from "@/types";
import { MantineColor } from "@mantine/core";
import { api } from "../apis";
import { ReorderTagsDto, TagDto, TagEntity, TagType } from "./tags-types";

export async function createTag(dto: TagDto) {
  return api.post(`/tags`, dto);
}

export async function getTags(query?: any) {
  return api.get<ResponseList<TagEntity>>(`/tags`, { params: query });
}

export async function updateTag(_id: string, dto: TagDto) {
  return api.put(`/tags/${_id}`, dto);
}

export async function removeTag(_id: string) {
  return api.delete(`/tags/${_id}`);
}

export async function reorderTags(dto: ReorderTagsDto) {
  return api.put(`/tags/reorder`, dto);
}

export async function getTagMetadata(slug: string): Promise<AppPageMetadata> {
  return api.get(`/tags/metadata/${slug}`);
}

export async function interactTag(tagId: string) {
  try {
    await api.post(`/tags/${tagId}/interact`);
  } catch (error) {}
}

export const tagTypeConfigs: Record<TagType, { color: MantineColor }> = {
  [TagType.CUSTOMER]: { color: "blue" },
  [TagType.MESSAGE_BOX]: { color: "green" },
  [TagType.TASK_FOLDER]: { color: "red" },
  [TagType.TASK]: { color: "yellow" },
};
