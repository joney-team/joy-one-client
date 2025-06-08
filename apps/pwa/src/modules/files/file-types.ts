import { BaseMongoEntity, Query, RelatedEntity } from "@/types";

export interface FileEntity extends BaseMongoEntity {
  type: FileType;
  fileName: string;
  size: number;
  url: string;
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
  addQueueUpload: (files: File[]) => Promise<FileEntity[]>,
  remove: (fileId: string) => Promise<void>,
  upload: (file: UploadFile) => Promise<FileEntity>,
}

export enum FileType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  MS_WORD = 'MS_WORD',
  MS_EXCEL = 'MS_EXCEL',
  MS_POWERPOINT = 'MS_POWERPOINT',
  UNKNOWN = 'UNKNOWN',
}

export interface UploadFileOptions {
  id?: string,
  progress?: number,
  error?: string,
  compressSize?: number,
  maxWidthOrHeight?: number,

  ref?: string,
  relatedCustomerId?: string,
  relatedTaskId?: string,
  relatedTicketId?: string,
  relatedReceiptId?: string,
  relatedHrmTimekeepingId?: string,
  relatedMessageId?: string,
  relatedLoanId?: string

  relatedEntities?: RelatedEntity[]
}

export interface UploadFile extends UploadFileOptions {
  file: File,
}

export interface FileQuery extends Query {
  relatedCustomerId?: string
  relatedTaskId?: string
  relatedTicketId?: string
}

export interface FileCapacity {
  totalSizeInBytes: number,
  limitSizeInBytes: number,
  totalSizeInString: string,
  count: number,
}