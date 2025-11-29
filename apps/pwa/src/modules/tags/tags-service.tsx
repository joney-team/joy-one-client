"use client";

import { AppPageMetadata, ResponseList } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { api } from "../apis";
import { getTasks } from "../tasks/tasks-service";
import { ReorderTagsDto, TagDto, TagEntity, TagType } from "./tags-types";
import { Trans } from "@lingui/react/macro";

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

export const onRemoveTaskTagFolder = (tag: TagEntity, onDone?: () => void) => {
  onActionLoad({
    isShowCompleted: false,
    name: <Trans>Remove folder</Trans>,
    icon: IconFolder,
    process: async () => {
      const relatedTasks = await getTasks({ folderId: tag._id, limit: 1 });
      onArchive({
        name: t`Folder`,
        icon: IconFolder,
        children:
          relatedTasks.count > 0
            ? `${t`Are you sure you want to continue?`} ${t`${relatedTasks.count} related work will be moved to the default folder`}`
            : undefined,
        process: async () => {
          await removeTag(tag._id).catch(onError);
          onDone?.();
        },
      });
    },
  });
};

export const tagTypeConfigs: Record<TagType, { color: MantineColor }> = {
  [TagType.CUSTOMER]: { color: "blue" },
  [TagType.MESSAGE_BOX]: { color: "green" },
  [TagType.TASK_FOLDER]: { color: "red" },
  [TagType.TASK]: { color: "yellow" },
};
