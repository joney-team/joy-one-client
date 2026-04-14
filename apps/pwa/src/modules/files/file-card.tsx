"use client";

import { Renderer } from "@/components/renderer";
import { FileType } from "@/graphql/enums.graphql";
import {
  detectFileIdFromUrl,
  detectFileType,
  getFileSizeFromUrl,
} from "@/modules/files/file-service";
import { ModalFilesViewer } from "@/modules/files/modals/modal-files-viewer";
import { formatBytes, getFileName } from "@/utils/file.utils";
import { useApolloClient } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
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
import { FileFragment } from "./graphql/fragmentFile.graphql";
import GetFileByIdDocument from "./graphql/getFileById.graphql";

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

  const client = useApolloClient();
  const [calculatedFileSize, setCalculatedFileSize] = useState<number | null>(null);
  const [file, setFile] = useState<FileFragment | null>();

  const fileSize = file?.size ?? calculatedFileSize;
  const filename = file?.fileName ?? getFileName(fileUri);

  const initialize = async () => {
    try {
      if (typeof src === "string") {
        const fileId = detectFileIdFromUrl(src);
        if (fileId) {
          const _file = await client
            .query({ query: GetFileByIdDocument, variables: { fileId } })
            .then((result) => result.data!.file);
          setFile(_file);
        } else {
          const size = await getFileSizeFromUrl(fileUri);
          setCalculatedFileSize(size);
        }
      } else {
        setCalculatedFileSize((src as File).size);
      }
    } catch (error) {
      console.warn(`Error when initializing file card > ${error}`);
    }
  };

  const getIconFile = () => {
    const fileType = detectFileType(src);
    if (fileType === FileType.Photo) return IconPhoto;
    if (fileType === FileType.Video) return IconVideo;
    if (fileType === FileType.Audio) return IconMusic;
    if (fileType === FileType.Pdf) return IconPdf;
    if (fileType === FileType.MsWord) return IconFileWord;
    if (fileType === FileType.MsExcel) return IconFileExcel;
    if (fileType === FileType.MsPowerpoint) return IconPresentationAnalytics;
    return IconFile;
  };

  const Icon = getIconFile();

  useEffect(() => {
    initialize().catch(() => null);
  }, []);

  const Stat: FC<{ embbedAvatar?: boolean; onView: () => void }> = (props) => {
    return (
      <Group gap={8} wrap="nowrap">
        <Avatar
          src={props.embbedAvatar ? fileUri : undefined}
          w={40}
          h={40}
          radius={6}
          onClick={props.onView}
          style={{ cursor: "pointer" }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </Avatar>

        <Stack gap={0} flex={1}>
          <Text fz={12} truncate maw={100}>
            {filename}
          </Text>
          <Text fz={10} c="gray.6">
            {fileSize !== null ? formatBytes(fileSize) : t`Unknown file size`}
          </Text>
        </Stack>

        <Group gap={0} wrap="nowrap">
          <Renderer visible={!!viewable}>
            <ActionIcon variant="subtle" color="gray.6" onClick={props.onView}>
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
      <ModalFilesViewer>
        {(openGallery) => {
          return (
            <Card withBorder shadow="none" p={0} w={300} {...rest}>
              <Avatar
                src={fileUri}
                radius={8}
                onClick={() => openGallery({ files: [{ url: fileUri, ...file }], readonly: true })}
                style={{ cursor: "pointer" }}
                mih={168}
                w="100%"
                {...thumbnail}
              >
                <Icon size={20} strokeWidth={1.5} />
              </Avatar>

              <Stack p={8} w="100%">
                <Stat
                  onView={() => {
                    openGallery({ files: [{ url: fileUri, ...file }], readonly: true });
                  }}
                />
              </Stack>
            </Card>
          );
        }}
      </ModalFilesViewer>
    );
  }

  return (
    <ModalFilesViewer>
      {(openGallery) => (
        <Card withBorder shadow="none" p={3} maw="100%" {...rest}>
          <Stat
            embbedAvatar
            onView={() => openGallery({ files: [{ url: fileUri, ...file }], readonly: true })}
          />
        </Card>
      )}
    </ModalFilesViewer>
  );
};
