import resource from "@/app.resource.json";
import { FileType } from "@/graphql/enums.graphql";
import config from "@joy-one/config";
import { isObjectID } from "@joy-one/utils/string";

export const fileSchema = "jof://";

export const fileExtensions: {
  [key in FileType]: string[];
} = {
  [FileType.Photo]: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "ico", "webp"],
  [FileType.Video]: ["mp4", "avi", "mov", "wmv", "flv", "mpeg", "mpg", "m4v", "webm", "mkv"],
  [FileType.Audio]: [
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
  [FileType.Pdf]: ["pdf"],
  [FileType.MsWord]: ["doc", "docx"],
  [FileType.MsExcel]: ["xls", "xlsx"],
  [FileType.MsPowerpoint]: ["ppt", "pptx"],
  [FileType.Unknown]: [],
};

export const renderFileUrl = (raw?: string | null) => {
  if (!raw || typeof raw !== "string") return "";
  if (resource.images.includes(raw.trim())) return raw;

  if (raw.includes("blob") || raw.indexOf("https") === 0 || raw.indexOf("http") === 0) return raw;

  if (raw.startsWith(fileSchema)) {
    return raw.replace(fileSchema, `${config.API_CLIENT_SIDE_URL}/files/`);
  }

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

export function safeGetFileId(id: string): string | null {
  const extension = String(id).split(".").pop();
  let parsedId = String(id).replace(`.${extension}`, "").trim();

  if (parsedId.startsWith(fileSchema)) {
    parsedId = parsedId.replace(fileSchema, "");
  }

  return isObjectID(parsedId) ? parsedId : null;
}

export const parseFile = (src: string | File) => {
  try {
    const fileName = parseFileName(src);
    const extension = parseFileExtension(src);
    const fileId = safeGetFileId(fileName);

    for (const [key, value] of Object.entries(fileExtensions)) {
      if (value.includes(extension)) {
        return {
          type: key as FileType,
          name: fileName,
          extension,
          fileId,
        };
      }
    }

    return {
      type: FileType.Unknown,
      name: fileName,
      extension,
      fileId,
    };
  } catch (error) {
    return {
      type: FileType.Unknown,
      name: "",
      extension: "",
    };
  }
};

export const getFileSizeInMB = (file: File) => {
  return file.size / (1024 * 1024);
};
