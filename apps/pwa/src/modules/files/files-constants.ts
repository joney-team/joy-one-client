import { FileType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
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

export const fileTypes: Record<FileType, { label: MacroMessageDescriptor; icon: Icon }> = {
  [FileType.Photo]: { label: defineMessage`Photo`, icon: IconPhoto },
  [FileType.Video]: { label: defineMessage`Video`, icon: IconVideo },
  [FileType.Audio]: { label: defineMessage`Audio`, icon: IconMusic },
  [FileType.Pdf]: { label: defineMessage`PDF`, icon: IconPdf },
  [FileType.MsWord]: { label: defineMessage`MS Word`, icon: IconFile },
  [FileType.MsExcel]: { label: defineMessage`MS Excel`, icon: IconFileExcel },
  [FileType.MsPowerpoint]: { label: defineMessage`MS PowerPoint`, icon: IconPresentationAnalytics },
  [FileType.Unknown]: { label: defineMessage`Unknown`, icon: IconFile },
};
