import { ResponseList } from "@/types";
import { useFetch } from "@/utils/use-fetch.util";
import { api } from "../apis";
import {
  MessageAttachmentType,
  MessageBoxEntity,
  MessageBoxPlatformType,
  MessageBoxStatus,
  MessageEntity,
  SendMemberFileMessageDto,
  SendMemberImageMessageDto,
  SendMemberTextMessageDto,
} from "./message-boxes-types";
import { EventType } from "@/graphql/enums.graphql";

export async function getMessageBoxes(query?: any) {
  return api.get<ResponseList<MessageBoxEntity>>("/message-boxes", { params: query });
}

export async function getMessageBox(id: string) {
  return api.get<MessageBoxEntity>(`/message-boxes/${id}`);
}

export async function getMessages(query?: any) {
  return api.get<ResponseList<MessageEntity>>("/messages", { params: query });
}

export async function getMessageBoxesByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  return api.get<MessageBoxEntity[]>(`/message-boxes/ids`, { params: { ids } });
}

export async function sendTextMessage(boxId: string, dto: SendMemberTextMessageDto) {
  return api.post<MessageEntity>(`/message-boxes/${boxId}/messages`, dto);
}

export async function sendImageMessage(boxId: string, dto: SendMemberImageMessageDto) {
  return api.post<MessageEntity>(`/message-boxes/${boxId}/messages/image`, dto);
}

export async function sendFileMessage(boxId: string, dto: SendMemberFileMessageDto) {
  return api.post<MessageEntity>(`/message-boxes/${boxId}/messages/file`, dto);
}

export async function setCustomerToMessageBox(id: string, customerId?: string | null) {
  return api.post(`/message-boxes/${id}/customer`, { customerId });
}

export async function setAssigneeToMessageBox(id: string, assigneeUserId?: string) {
  return api.post(`/message-boxes/${id}/assignee`, { assigneeUserId });
}

export async function closeMesssageBox(id: string) {
  return api.post(`/message-boxes/${id}/close`);
}

export async function toggleMessageBoxAiAssistant(id: string, disabled?: boolean) {
  return api.post(`/message-boxes/${id}/ai-assistant`, { disabled });
}

export async function removeMessageBox(id: string) {
  return api.delete(`/message-boxes/${id}`);
}

export const messageBoxStatusColors: { [key in MessageBoxStatus]: string } = {
  CLOSED: "gray",
  EXPIRED: "gray",
  IN_PROGRESS: "primary",
  WAITING: "orange",
};

export const useMessageBox = (id: string) => {
  const box = useFetch(
    {
      id: `message-box-${id}`,
      skip: !id,
      fetch: async () => {
        if (!id) return;
        return getMessageBox(id);
      },
      refetchEvents: [
        EventType.MessageBoxInProgress,
        EventType.MessageBoxClosed,
        EventType.MessageBoxWaiting,
        EventType.MessageBoxUpdated,
        EventType.CustomerUpdated,
      ],
    },
    [id]
  );

  return box;
};

export const detectMessageAttachmentType = (url: string) => {
  const extension = url.split(".").pop();
  if (extension) {
    if (["jpg", "jpeg", "png", "gif", "bmp", "tiff", "ico"].includes(extension))
      return MessageAttachmentType.IMAGE;
    if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension))
      return MessageAttachmentType.VIDEO;
    if (["mp3", "wav", "ogg", "aac", "m4a"].includes(extension)) return MessageAttachmentType.AUDIO;
    if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension))
      return MessageAttachmentType.FILE;
  }
  return MessageAttachmentType.UNKNOWN;
};

export const messageBoxPlatformImages: {
  [key in MessageBoxPlatformType]: string;
} = {
  [MessageBoxPlatformType.ZALO]: "/images/plugins-zalo-oa.svg",
  [MessageBoxPlatformType.META_PAGE]: "/images/plugins-meta-pages.svg",
  [MessageBoxPlatformType.MESSAGE_HUB]: "/images/plugins-message-hubs.svg",
};
