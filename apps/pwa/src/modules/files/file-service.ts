import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
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
  IconUpload,
  IconVideo,
} from "@tabler/icons-react";
import imageCompression, { Options } from "browser-image-compression";
import { apiTools } from "../apis";
import { t } from "../lang/lang-service";
import { FileEntity, FileType, UploadFile } from "./file-types";
import { parseFile } from "./files-utils";

export function getFileExtension(fileName: string | File) {
  return parseFile(typeof fileName === "string" ? fileName : fileName.name).extension;
}

export function detectFileType(fileName: string | File): FileType {
  return parseFile(typeof fileName === "string" ? fileName : fileName.name).type;
}

export function getMineTypeAccept(fileType: FileType[]) {
  let output: string[] = [];
  if (fileType.includes(FileType.PHOTO)) output = output.concat(IMAGE_MIME_TYPE);
  if (fileType.includes(FileType.PDF)) output = output.concat(PDF_MIME_TYPE);
  if (fileType.includes(FileType.MS_WORD)) output = output.concat(MS_WORD_MIME_TYPE);
  if (fileType.includes(FileType.MS_EXCEL)) output = output.concat(MS_EXCEL_MIME_TYPE);
  if (fileType.includes(FileType.MS_POWERPOINT)) output = output.concat(MS_POWERPOINT_MIME_TYPE);
  if (fileType.includes(FileType.VIDEO))
    output = [...output, "video/mp4", "video/x-msvideo", "video/mpeg", "video/ogg", "video/webm"];

  return output;
}

export async function getFiles(query?: any) {
  return apiTools.get<ResponseList<FileEntity>>(`/files`, { params: query });
}

export async function removeFileFromRelativePath(relativePath: string) {
  return apiTools.delete(`/files/paths/${relativePath}`);
}

export async function removeFile(fileId: string) {
  return onActionLoad({
    name: "Xóa tệp tin",
    process: () => apiTools.delete(`/files/${fileId}`),
  });
}

export async function reducePhotoSize(file: File, option: Options) {
  const isImage = IMAGE_MIME_TYPE.includes(file.type as any);
  if (!isImage) return file;

  const reducedFile = new File([await imageCompression(file, option)], file.name);
  return reducedFile;
}

async function handleUploadFile(uploadFile: UploadFile, route: string) {
  const formData = new FormData();
  let file = uploadFile.file;

  // Handle image compression > Resize if file size > 2MB
  const isImage = IMAGE_MIME_TYPE.includes(uploadFile.file.type as any);
  const imgCompressSize = uploadFile.compressSize || 1;
  if (
    (isImage && uploadFile.compressSize !== 0 && file.size / (1024 * 1024) > imgCompressSize) ||
    uploadFile.maxWidthOrHeight
  ) {
    file = await reducePhotoSize(
      file,
      uploadFile.maxWidthOrHeight
        ? { maxWidthOrHeight: uploadFile.maxWidthOrHeight }
        : { maxSizeMB: imgCompressSize }
    );
  }

  formData.append("file", file);

  if (uploadFile.ref) formData.append("ref", uploadFile.ref);
  if (uploadFile.relatedCustomerId)
    formData.append("relatedCustomerId", uploadFile.relatedCustomerId);
  if (uploadFile.relatedTicketId) formData.append("relatedTicketId", uploadFile.relatedTicketId);
  if (uploadFile.relatedTaskId) formData.append("relatedTaskId", uploadFile.relatedTaskId);
  if (uploadFile.relatedReceiptId) formData.append("relatedReceiptId", uploadFile.relatedReceiptId);
  if (uploadFile.relatedHrmTimekeepingId)
    formData.append("relatedHrmTimekeepingId", uploadFile.relatedHrmTimekeepingId);
  if (uploadFile.relatedLoanId) formData.append("relatedLoanId", uploadFile.relatedLoanId);
  if (uploadFile.relatedEntities)
    formData.append("relatedEntities", JSON.stringify(uploadFile.relatedEntities));

  return apiTools.formData<FileEntity>(route, formData);
}

export async function uploadFile(uploadFile: UploadFile) {
  return handleUploadFile(uploadFile, "/files/upload");
}

export async function onUploadFiles(
  files: UploadFile[],
  onUploaded?: (files: FileEntity[]) => Promise<void> | void
) {
  return onActionLoad<FileEntity[]>({
    name: t("upload_files"),
    icon: IconUpload,
    process: async () => {
      let _files: FileEntity[] = [];

      for (let file of files) {
        const res = await uploadFile(file);
        _files.push(res);
      }

      await onUploaded?.(_files);
      return _files;
    },
  });
}

export async function onUploadFile(
  file: UploadFile,
  onUploaded?: (file: FileEntity) => Promise<void> | void
) {
  return onActionLoad<FileEntity>({
    name: t("upload_files"),
    icon: IconUpload,
    process: async () => {
      const res = await uploadFile(file);
      await onUploaded?.(res);
      return res;
    },
  });
}

export async function getFileInfo(rawUrl: string) {
  const fileName = rawUrl.split("/").pop();
  return apiTools.get<FileEntity>(`/files/${fileName?.split(".")[0]}/info`);
}

export const fileTypeIcons: Record<FileType, Icon> = {
  [FileType.PHOTO]: IconPhoto,
  [FileType.VIDEO]: IconVideo,
  [FileType.AUDIO]: IconMusic,
  [FileType.PDF]: IconPdf,
  [FileType.MS_WORD]: IconFile,
  [FileType.MS_EXCEL]: IconFile,
  [FileType.MS_POWERPOINT]: IconFile,
  [FileType.UNKNOWN]: IconFile,
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
