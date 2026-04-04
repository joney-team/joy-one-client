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
