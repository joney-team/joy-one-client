import { AppPageMetadata, ResponseList } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { IconFolder } from "@tabler/icons-react";
import { api } from "../apis";
import { t } from "../lang/lang-service";
import { getTasks } from "../tasks/tasks-service";
import { ReorderTagsDto, TagDto, TagEntity } from "./tags-types";

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
    process: async () => {
      const relatedTasks = await getTasks({ tagFolderId: tag._id, limit: 1 });
      onArchive({
        name: t('folder'),
        icon: IconFolder,
        children: relatedTasks.count > 0 ? `${t('confirm_next')} ${relatedTasks.count} ${t('remove_task_desc')}` : undefined,
        process: async () => {
          await removeTag(tag._id)
            .catch(onError)
          onDone?.();
        },
      })
    },
  })
}