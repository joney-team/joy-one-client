import { FileType } from "@/graphql/enums.graphql";
import { BaseMongoEntity, Query } from "@/types";

export interface FileEntity extends BaseMongoEntity {
  type: FileType;
  fileName: string;
  size: number;
  url: string;
  path: string;
  relativePath: string;
  ref?: string;
  relatedCustomerId?: string;
  relatedTaskId?: string;
  relatedTicketId?: string;
  relatedReceiptId?: string;
  relatedMessageId?: string;
}

export interface FilesContext {
  files: FileEntity[];
  uploadFiles: UploadFile[];
  addQueueUpload: (files: File[]) => Promise<FileEntity[]>;
  remove: (fileId: string) => Promise<void>;
  upload: (file: UploadFile) => Promise<FileEntity>;
}

export interface UploadFileOptions {
  id?: string;
  progress?: number;
  error?: string;
  compressSize?: number;
  maxWidthOrHeight?: number;
  refs?: string[];
  isPersonal?: boolean;
}

export interface UploadFile extends UploadFileOptions {
  file: File;
}

export interface FileQuery extends Query {
  relatedCustomerId?: string;
  relatedTaskId?: string;
  relatedTicketId?: string;
}

export interface FileCapacity {
  totalSizeInBytes: number;
  limitSizeInBytes: number;
  totalSizeInString: string;
  count: number;
}
