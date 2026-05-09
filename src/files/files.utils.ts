import { BadRequestException } from '@nestjs/common';
import { configs } from '../config/config';
import { StringUtils } from '../utils/string.utils';
import { FileType } from './files.types';
import { AppMessage } from '../app.message';
import { FileEntity } from './files.entity';
import { FILES_SCHEMA } from './files.constants';

export const fileExtensions: {
  [key in FileType]: string[];
} = {
  [FileType.PHOTO]: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'ico', 'webp'],
  [FileType.VIDEO]: [
    'mp4',
    'avi',
    'mov',
    'wmv',
    'flv',
    'mpeg',
    'mpg',
    'm4v',
    'webm',
    'mkv',
  ],
  [FileType.AUDIO]: [
    'mp3',
    'wav',
    'ogg',
    'm4a',
    'wma',
    'aac',
    'flac',
    'm4b',
    'm4p',
    'm4r',
    'm4b',
    'm4p',
    'm4r',
  ],
  [FileType.PDF]: ['pdf'],
  [FileType.MS_WORD]: ['doc', 'docx'],
  [FileType.MS_EXCEL]: ['xls', 'xlsx'],
  [FileType.MS_POWERPOINT]: ['ppt', 'pptx'],
  [FileType.UNKNOWN]: [],
};

export function parseFileUrl(url?: string) {
  if (!url) return '';
  if (StringUtils.isURL(url)) return url;
  return `${configs.API_URL}/files/${url}`;
}

export function getFileUrlFromRelativePath(path: string) {
  if (StringUtils.isURL(path)) return path;
  return `${configs.API_URL}/files/${path}`;
}

export const renderFileLink = (raw?: string | null) => {
  if (!raw || typeof raw !== 'string') return '';
  if (
    raw.includes('blob') ||
    raw.indexOf('https') === 0 ||
    raw.indexOf('http') === 0
  )
    return raw;

  if (raw.includes(FILES_SCHEMA)) {
    return raw.replace(FILES_SCHEMA, `${configs.API_URL}/files/`);
  }

  return `${configs.API_URL}/files/${raw}`;
};

export const getFileNameFromUrl = (url: string) => {
  try {
    return url.split('/').pop();
  } catch (error) {
    return '';
  }
};

export const parseFileFromUrl = (
  url: string,
): { type: FileType; fileName: string; extension: string } => {
  try {
    const fileName = getFileNameFromUrl(url);
    const extension = fileName.split('.').pop().toLowerCase();

    for (const [key, value] of Object.entries(fileExtensions)) {
      if (value.includes(extension)) {
        return {
          type: key as FileType,
          fileName,
          extension,
        };
      }
    }

    return {
      type: FileType.UNKNOWN,
      fileName,
      extension,
    };
  } catch (error) {
    return {
      type: FileType.UNKNOWN,
      fileName: '',
      extension: '',
    };
  }
};

export const mustFileExist = (file: Express.Multer.File) => {
  if (!file) {
    throw new BadRequestException(AppMessage.FILE_MUST_BE_PROVIDED);
  }
};

export const limitFileSize = (
  file: Express.Multer.File,
  sizeInMegabytes: number,
) => {
  if (file.size > sizeInMegabytes * 1024 * 1024) {
    throw new BadRequestException(AppMessage.FILE_SIZE_LIMIT_EXCEEDED);
  }
};

export const limitFileTypes = (
  file: Express.Multer.File,
  types: FileType[],
) => {
  const { type } = parseFileFromUrl(file.originalname);
  if (!types.includes(type)) {
    throw new BadRequestException(AppMessage.FILE_TYPE_NOT_ALLOWED);
  }
};

function addCacheBuster(url: string): string {
  const cacheBuster = `cache_buster=${Date.now()}`;
  return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
}

async function getFileSizeFromUrlWithoutContentLength(
  url: string,
): Promise<number | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' }); // Bỏ qua cache

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
    const response = await fetch(cacheBustedUrl, { method: 'HEAD' });

    if (!response.ok) {
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    } else {
      return getFileSizeFromUrlWithoutContentLength(url);
    }
  } catch (error) {
    return null;
  }
}

export function normalizeFileResponse(file: FileEntity): Omit<
  FileEntity,
  'updateTimestampsOnInsert' | 'updateTimestampOnUpdate'
> & {
  url: string;
} {
  return {
    ...file,
    path: `${FILES_SCHEMA}${file._id.toString()}.${file.fileName.split('.').pop()}`,
    url: `${configs.API_URL}/files/${file._id.toString()}.${file.fileName.split('.').pop()}`,
  };
}
