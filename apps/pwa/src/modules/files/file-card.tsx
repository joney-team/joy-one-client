import { Renderer } from "@/components/renderer";
import {
  detectFileIdFromUrl,
  detectFileType,
  getFileSizeFromUrl,
} from "@/modules/files/file-service";
import { FileEntity, FileType } from "@/modules/files/file-types";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { t } from "@/modules/lang/lang-service";
import { formatBytes, getFileName } from "@/utils/file.utils";
import {
  ActionIcon,
  Avatar,
  AvatarProps,
  Card,
  CardProps,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDownload,
  IconEye,
  IconFile,
  IconFileExcel,
  IconFileWord,
  IconMusic,
  IconPdf,
  IconPhoto,
  IconPresentationAnalytics,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { renderFileUrl } from "./files-utils";
import { api, apiTools } from "../apis";

interface FileCardProps extends CardProps {
  src: File | string;
  viewable?: boolean;
  onRemove?: () => void;
  thumbnail?: AvatarProps;
  type?: "common" | "preview";
}

export const FileCard: FC<FileCardProps> = ({
  src,
  viewable,
  onRemove,
  type = "common",
  thumbnail,
  ...rest
}) => {
  const fileUri =
    typeof src === "string"
      ? renderFileUrl(src)
      : src instanceof File
      ? URL.createObjectURL(src)
      : "";

  const [calculatedFileSize, setCalculatedFileSize] = useState<number | null>(null);
  const [file, setFile] = useState<FileEntity | null>();
  const fileSize = file?.size ?? calculatedFileSize;

  const initialize = async () => {
    try {
      if (typeof src === "string") {
        const fileId = detectFileIdFromUrl(src);
        if (fileId) {
          const _file = await api.get(`/files/${fileId}/info`);
          setFile(_file);
        } else {
          const size = await getFileSizeFromUrl(fileUri);
          setCalculatedFileSize(size);
        }
      } else {
        setCalculatedFileSize((src as File).size);
      }
    } catch {}
  };

  const getIconFile = () => {
    const fileType = detectFileType(src);
    if (fileType === FileType.PHOTO) return IconPhoto;
    if (fileType === FileType.VIDEO) return IconVideo;
    if (fileType === FileType.AUDIO) return IconMusic;
    if (fileType === FileType.PDF) return IconPdf;
    if (fileType === FileType.MS_WORD) return IconFileWord;
    if (fileType === FileType.MS_EXCEL) return IconFileExcel;
    if (fileType === FileType.MS_POWERPOINT) return IconPresentationAnalytics;
    return IconFile;
  };

  const Icon = getIconFile();

  const onViewModal = () => {
    OnModalFileGallery({ files: [{ url: fileUri, ...file }], readonly: true });
  };

  useEffect(() => {
    initialize().catch(() => null);
  }, []);

  const Stat: FC<{ embbedAvatar?: boolean }> = (props) => {
    return (
      <Group gap={8} wrap="nowrap">
        <Avatar
          src={props.embbedAvatar ? fileUri : undefined}
          w={40}
          h={40}
          radius={6}
          onClick={onViewModal}
          style={{ cursor: "pointer" }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </Avatar>

        <Stack gap={0} flex={1}>
          <Text fz={12}>{file?.fileName ?? t(getFileName(src, 4))}</Text>
          <Text fz={10} c="gray.6">
            {fileSize !== null ? formatBytes(fileSize) : t("unknown_file_size")}
          </Text>
        </Stack>

        <Group gap={0} wrap="nowrap">
          <Renderer visible={!!viewable}>
            <ActionIcon variant="subtle" color="gray.6" onClick={onViewModal}>
              <IconEye size={16} />
            </ActionIcon>
          </Renderer>

          <Renderer visible={!!viewable}>
            <ActionIcon
              variant="subtle"
              color="gray.6"
              onClick={() => window.open(src as string, "_blank")}
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Renderer>

          <Renderer visible={!!onRemove}>
            <ActionIcon variant="subtle" color="gray.6" onClick={onRemove}>
              <IconX size={13} />
            </ActionIcon>
          </Renderer>
        </Group>
      </Group>
    );
  };

  if (type === "preview") {
    return (
      <Card withBorder shadow="none" p={0} w={300} {...rest}>
        <Avatar
          src={fileUri}
          radius={8}
          onClick={onViewModal}
          style={{ cursor: "pointer" }}
          mih={168}
          w="100%"
          {...thumbnail}
        >
          <Icon size={20} strokeWidth={1.5} />
        </Avatar>

        <Stack p={8} w="100%">
          <Stat />
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="none" p={3} maw="100%" {...rest}>
      <Stat embbedAvatar />
    </Card>
  );
};
