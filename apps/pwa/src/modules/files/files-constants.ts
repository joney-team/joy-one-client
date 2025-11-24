import { FileType } from "@/graphql/enums.graphql";
import { t } from "@lingui/core/macro";
import {
  Icon,
  IconFile,
  IconFileExcel,
  IconMusic,
  IconPdf,
  IconPhoto,
  IconPresentationAnalytics,
  IconVideo,
} from "@tabler/icons-react";

export const fileTypes: Record<FileType, { label: () => string; icon: Icon }> = {
  [FileType.Photo]: { label: () => t`Photo`, icon: IconPhoto },
  [FileType.Video]: { label: () => t`Video`, icon: IconVideo },
  [FileType.Audio]: { label: () => t`Audio`, icon: IconMusic },
  [FileType.Pdf]: { label: () => "PDF", icon: IconPdf },
  [FileType.MsWord]: { label: () => "MS Word", icon: IconFile },
  [FileType.MsExcel]: { label: () => "MS Excel", icon: IconFileExcel },
  [FileType.MsPowerpoint]: { label: () => "MS PowerPoint", icon: IconPresentationAnalytics },
  [FileType.Unknown]: { label: () => t`Unknown`, icon: IconFile },
};
