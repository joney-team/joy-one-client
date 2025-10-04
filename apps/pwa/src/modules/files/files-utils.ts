import config from "@joy-one-client/config";
import resource from "@/app.resource.json";
import { FileType } from "./file-types";

export const fileExtensions: {
  [key in FileType]: string[];
} = {
  [FileType.PHOTO]: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "ico", "webp"],
  [FileType.VIDEO]: ["mp4", "avi", "mov", "wmv", "flv", "mpeg", "mpg", "m4v", "webm", "mkv"],
  [FileType.AUDIO]: [
    "mp3",
    "wav",
    "ogg",
    "m4a",
    "wma",
    "aac",
    "flac",
    "m4b",
    "m4p",
    "m4r",
    "m4b",
    "m4p",
    "m4r",
  ],
  [FileType.PDF]: ["pdf"],
  [FileType.MS_WORD]: ["doc", "docx"],
  [FileType.MS_EXCEL]: ["xls", "xlsx"],
  [FileType.MS_POWERPOINT]: ["ppt", "pptx"],
  [FileType.UNKNOWN]: [],
};

export const renderLink = (raw?: string | null) => {
  if (!raw || typeof raw !== "string") return "";
  if (resource.images.includes(raw.trim())) return raw;

  if (raw.includes("blob") || raw.indexOf("https") === 0 || raw.indexOf("http") === 0) return raw;
  if (raw.startsWith("jof://"))
    return raw.replace("jof://", `${config.API_CLIENT_SIDE_URL}/files/`);
  return `${config.API_CLIENT_SIDE_URL}/files/${raw}`;
};

export const parseFileName = (src: string | File) => {
  try {
    return src instanceof File ? src.name : src.split("/").pop() || "";
  } catch (error) {
    return "";
  }
};

export const parseFileExtension = (src: string | File) => {
  try {
    const fileName = parseFileName(src);
    return fileName.split(".").pop()?.toLowerCase() || "";
  } catch (error) {
    return "";
  }
};

export const parseFile = (src: string | File) => {
  try {
    const fileName = parseFileName(src);
    const extension = parseFileExtension(src);

    for (const [key, value] of Object.entries(fileExtensions)) {
      if (value.includes(extension)) {
        return {
          type: key as FileType,
          name: fileName,
          extension,
        };
      }
    }

    return {
      type: FileType.UNKNOWN,
      name: fileName,
      extension,
    };
  } catch (error) {
    return {
      type: FileType.UNKNOWN,
      name: "",
      extension: "",
    };
  }
};

export const getFileSizeInMB = (file: File) => {
  return file.size / (1024 * 1024);
};
