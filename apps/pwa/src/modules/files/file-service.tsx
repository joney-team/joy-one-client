"use client";

import { FileType } from "@/graphql/enums.graphql";
import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { Trans } from "@lingui/react/macro";
import {
  IMAGE_MIME_TYPE,
  MS_EXCEL_MIME_TYPE,
  MS_POWERPOINT_MIME_TYPE,
  MS_WORD_MIME_TYPE,
  PDF_MIME_TYPE,
} from "@mantine/dropzone";
import {
  Icon,
  IconFile,
  IconMusic,
  IconPdf,
  IconPhoto,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import imageCompression, { Options } from "browser-image-compression";
import { apiClient } from "../apis";
import { FileEntity } from "./file-types";
import { parseFile } from "./files-utils";

export function getFileExtension(fileName: string | File) {
  return parseFile(typeof fileName === "string" ? fileName : fileName.name).extension;
}

export function detectFileType(fileName: string | File): FileType {
  return parseFile(typeof fileName === "string" ? fileName : fileName.name).type;
}

export function getMineTypeAccept(fileType: FileType[]) {
  let output: string[] = [];
  if (fileType.includes(FileType.Photo)) output = output.concat(IMAGE_MIME_TYPE);
  if (fileType.includes(FileType.Pdf)) output = output.concat(PDF_MIME_TYPE);
  if (fileType.includes(FileType.MsWord)) output = output.concat(MS_WORD_MIME_TYPE);
  if (fileType.includes(FileType.MsExcel)) output = output.concat(MS_EXCEL_MIME_TYPE);
  if (fileType.includes(FileType.MsPowerpoint)) output = output.concat(MS_POWERPOINT_MIME_TYPE);
  if (fileType.includes(FileType.Video))
    output = [...output, "video/mp4", "video/x-msvideo", "video/mpeg", "video/ogg", "video/webm"];

  return output;
}

export async function getFiles(query?: any) {
  return apiClient.get<ResponseList<FileEntity>>(`/files`, { params: query });
}

export async function removeFileFromRelativePath(relativePath: string) {
  return apiClient.delete(`/files/paths/${relativePath}`);
}

export async function removeFile(fileId: string) {
  return onActionLoad({
    name: <Trans>Remove file</Trans>,
    icon: IconTrash,
    process: () => apiClient.delete(`/files/${fileId}`),
  });
}

export async function reducePhotoSize(file: File, option: Options) {
  const isImage = IMAGE_MIME_TYPE.includes(file.type as any);
  if (!isImage) return file;

  const reducedFile = new File([await imageCompression(file, option)], file.name);
  return reducedFile;
}

export async function getFileInfo(rawUrl: string) {
  const fileName = rawUrl.split("/").pop();
  return apiClient.get<FileEntity>(`/files/${fileName?.split(".")[0]}/info`);
}

export const fileTypeIcons: Record<FileType, Icon> = {
  [FileType.Photo]: IconPhoto,
  [FileType.Video]: IconVideo,
  [FileType.Audio]: IconMusic,
  [FileType.Pdf]: IconPdf,
  [FileType.MsWord]: IconFile,
  [FileType.MsExcel]: IconFile,
  [FileType.MsPowerpoint]: IconFile,
  [FileType.Unknown]: IconFile,
};

export function getFileTypeIcon(fileType: FileType) {
  return fileTypeIcons[fileType];
}

export async function downloadFileFromURL(url: string, filename: string) {
  // Use fetch to get the file from the URL
  return fetch(url)
    .then((response) => {
      // Check if the response is OK
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.blob(); // Convert the response to a Blob
    })
    .then((blob) => {
      // Create a new object URL for the Blob
      const blobURL = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = filename; // Set the download attribute with the filename

      // Append the link to the document body and trigger a click to start download
      document.body.appendChild(link);
      link.click();

      // Remove the link after triggering the download
      document.body.removeChild(link);

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(blobURL);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

export const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result!.toString());
    reader.onerror = reject;
  });

function addCacheBuster(url: string): string {
  const cacheBuster = `cache_buster=${Date.now()}`;
  return url.includes("?") ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
}

async function getFileSizeFromUrlWithoutContentLength(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { cache: "no-store" }); // Bỏ qua cache

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob(); // Tải tệp dưới dạng blob
    return blob.size; // Kích thước tệp (tính bằng byte)
  } catch (error) {
    return null;
  }
}

export async function getFileSizeFromUrl(url: string): Promise<number | null> {
  const cacheBustedUrl = addCacheBuster(url); // Bypass cache
  try {
    const response = await fetch(cacheBustedUrl, { method: "HEAD" });

    if (!response.ok) {
      return null;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      return parseInt(contentLength, 10);
    } else {
      return getFileSizeFromUrlWithoutContentLength(url);
    }
  } catch (error) {
    return null;
  }
}

export function detectFileIdFromUrl(url: string): string | null {
  if (url.startsWith("jof://")) {
    return url.replace("jof://", "").split("/").pop()?.split(".")[0] || null;
  }

  return null;
}

const refFiles = new Map<string, File>();

export function setRefFile(id: string, file: File) {
  refFiles.set(id, file);
}

export function getRefFile(id: string): File | undefined {
  return refFiles.get(id);
}

export function removeRefFile(id: string) {
  refFiles.delete(id);
}
