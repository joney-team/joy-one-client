import {
  Icon,
  IconPhoto,
  IconVideo,
  IconPdf,
  IconFile,
  IconFileExcel,
  IconMusic,
  IconPresentationAnalytics,
} from "@tabler/icons-react";
import { FileType } from "./file-types";
import { t } from "@lingui/core/macro";

export const fileTypes: Record<FileType, { label: () => string; icon: Icon }> = {
  [FileType.PHOTO]: { label: () => t`Photo`, icon: IconPhoto },
  [FileType.VIDEO]: { label: () => t`Video`, icon: IconVideo },
  [FileType.AUDIO]: { label: () => t`Audio`, icon: IconMusic },
  [FileType.PDF]: { label: () => "PDF", icon: IconPdf },
  [FileType.MS_WORD]: { label: () => "MS Word", icon: IconFile },
  [FileType.MS_EXCEL]: { label: () => "MS Excel", icon: IconFileExcel },
  [FileType.MS_POWERPOINT]: { label: () => "MS PowerPoint", icon: IconPresentationAnalytics },
  [FileType.UNKNOWN]: { label: () => t`Unknown`, icon: IconFile },
};
