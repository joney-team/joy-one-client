import { AppPageMetadata, ResponseList } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { IconFolder } from "@tabler/icons-react";
import { t } from "../lang/lang-service";
import { MainRequest } from "../requests/main.request";
import { getTasks } from "../tasks/tasks-service";
import { ReorderTagsDto, TagDto, TagEntity } from "./tags-types";

export async function createTag(dto: TagDto) {
  return MainRequest.post(`/tags`, dto);
}

export async function getTags(query?: any) {
  return MainRequest.get<ResponseList<TagEntity>>(`/tags`, query);
}

export async function updateTag(_id: string, dto: TagDto) {
  return MainRequest.put(`/tags/${_id}`, dto);
}

export async function removeTag(_id: string) {
  return MainRequest.delete(`/tags/${_id}`);
}

export async function reorderTags(dto: ReorderTagsDto) {
  return MainRequest.put(`/tags/reorder`, dto);
}

export async function getTagMetadata(slug: string): Promise<AppPageMetadata> {
  return MainRequest.get(`/tags/metadata/${slug}`);
}

export async function interactTag(tagId: string) {
  try {
    await MainRequest.post(`/tags/${tagId}/interact`);
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