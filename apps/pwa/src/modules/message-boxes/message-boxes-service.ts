import { MessageAttachmentType } from "@/graphql/enums.graphql";

export const detectMessageAttachmentType = (url: string) => {
  const extension = url.split(".").pop();
  if (extension) {
    if (["jpg", "jpeg", "png", "gif", "bmp", "tiff", "ico"].includes(extension))
      return MessageAttachmentType.Image;
    if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension))
      return MessageAttachmentType.Video;
    if (["mp3", "wav", "ogg", "aac", "m4a"].includes(extension)) return MessageAttachmentType.Audio;
    if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension))
      return MessageAttachmentType.File;
  }
  return MessageAttachmentType.Unknown;
};
