import { Renderer } from "@/components/renderer";
import { detectFileType, getFileSizeFromUrl } from "@/modules/files/file-service";
import { FileType } from "@/modules/files/file-types";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { t } from "@/modules/lang/lang-service";
import { formatBytes, getFileName } from "@/utils/file.utils";
import { ActionIcon, Avatar, Card, Group, Stack, Text } from "@mantine/core";
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

interface FileSrcCardProps {
  src: File | string;
  viewable?: boolean;
  onRemove?: () => void;
  size?: "medium" | "large";
}

export const FileSrcCard: FC<FileSrcCardProps> = (props) => {
  const { src, onRemove, viewable } = props;
  const imageSrc = typeof src === "string" ? src : src instanceof File ? URL.createObjectURL(src) : "";
  const size = props.size || "medium";

  const [fileSize, setFileSize] = useState<number | null>(null);

  const getFileSize = async () => {
    if (typeof src === "string") {
      const size = await getFileSizeFromUrl(src);
      setFileSize(size);
    } else {
      setFileSize((src as File).size);
    }
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
    OnModalFileGallery({ files: [{ url: src instanceof File ? URL.createObjectURL(src) : src }] });
  };

  useEffect(() => {
    getFileSize().catch(() => null);
  }, []);

  const Stat: FC<{ embbedAvatar?: boolean }> = (props) => {
    return (
      <Group gap={8} wrap="nowrap">
        <Avatar
          src={props.embbedAvatar ? imageSrc : undefined}
          w={40}
          h={40}
          radius={8}
          onClick={onViewModal}
          style={{ cursor: "pointer" }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </Avatar>

        <Stack gap={0} flex={1}>
          <Text fz={12}>{t(getFileName(src, 4))}</Text>
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
            <ActionIcon variant="subtle" color="gray.6" onClick={() => window.open(src as string, "_blank")}>
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

  if (size === "large") {
    return (
      <Card withBorder shadow="none" p={0} w={300}>
        <Card.Section>
          <Avatar
            src={imageSrc}
            w="100%"
            h="100%"
            radius={8}
            onClick={onViewModal}
            style={{ cursor: "pointer" }}
            mih={168}
          >
            <Icon size={20} strokeWidth={1.5} />
          </Avatar>
        </Card.Section>

        <Stack p={8} w="100%">
          <Stat />
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="none" p={3} maw="100%">
      <Stat embbedAvatar />
    </Card>
  );
};
