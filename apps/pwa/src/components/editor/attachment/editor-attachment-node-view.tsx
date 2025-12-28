"use client";

import { Card, Group, Loader, Skeleton, Text, ThemeIcon } from "@mantine/core";
import { IconDownload, IconEye, IconPaperclip } from "@tabler/icons-react";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";

import { ActionIcon } from "@/components/action-icon/action-icon";
import {
  detectFileType,
  downloadFileFromURL,
  getRefFile,
  removeRefFile,
} from "@/modules/files/file-service";
import { fileTypes } from "@/modules/files/files-constants";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { type ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import GET_FILE_INFO, {
  type GetFileInfoQuery,
  type GetFileInfoQueryVariables,
} from "@/modules/files/modals/queryFileInfo.graphql";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import dynamic from "next/dynamic";
import { FC, Fragment, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { AttachmentAttrs } from "./editor-attachment-types";
import styles from "./editor-attachment.module.css";

const ModalFileGallery = dynamic(
  () => import("@/modules/files/modals/modal-file-gallery").then((mod) => mod.ModalFileGallery),
  { ssr: false, loading: nonLoading }
);

const AttachmentFile: FC<{ fileId: string }> = ({ fileId }) => {
  const modalFileGalleryRef = useRef<ModalFileGalleryRef>(null);
  const file = useQuery<GetFileInfoQuery, GetFileInfoQueryVariables>(GET_FILE_INFO, {
    variables: { fileId },
    fetchPolicy: "cache-first",
  });

  const onDownload = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!file.data || !file.data?.getFileInfo?.url) return;
    await downloadFileFromURL(file.data?.getFileInfo?.url, file.data?.getFileInfo?.fileName || "");
  };

  const content = useMemo(() => {
    if (file.loading) {
      return {
        icon: IconPaperclip,
        name: <Skeleton height={28} width={200} />,
      };
    }

    if (!file.data) {
      return {
        icon: IconPaperclip,
        name: (
          <Text fz="xs" fw={500} truncate maw={200} style={{ marginBottom: 0 }}>
            File is unavailable
          </Text>
        ),
      };
    }

    const fileType = detectFileType(file.data?.getFileInfo?.url);
    const fileTypeConstant = fileTypes[fileType];

    return {
      icon: fileTypeConstant.icon,
      name: (
        <Group gap="xs">
          <Text fz="xs" fw={500} truncate maw={200} style={{ marginBottom: 0 }}>
            {file.data?.getFileInfo?.fileName}
          </Text>

          <Group gap={0}>
            <ActionIcon variant="subtle" color="gray.6">
              <IconEye size={14} />
            </ActionIcon>

            <ActionIcon variant="subtle" color="gray.6" onClick={onDownload}>
              <IconDownload size={14} />
            </ActionIcon>
          </Group>
        </Group>
      ),
    };
  }, [file]);

  return (
    <Fragment>
      <Card
        withBorder
        p={5}
        component="span"
        w="max-content"
        className="clickable"
        onClick={() => {
          if (!file.data) return;
          modalFileGalleryRef.current?.open({
            files: [file.data?.getFileInfo],
          });
        }}
      >
        <Group gap={5}>
          <ThemeIcon color="gray" variant="light">
            <content.icon size={14} />
          </ThemeIcon>

          {content.name}
        </Group>
      </Card>
      <ModalFileGallery ref={modalFileGalleryRef} />
    </Fragment>
  );
};

export const AttachmentNodeView = ({ node }: ReactNodeViewProps) => {
  const { id } = node.attrs as AttachmentAttrs;
  const refFile = getRefFile(id);
  const uploadFile = useUploadFile();
  const [uploadStatus, setUploadStatus] = useState<"uploading" | "uploaded" | "failed">(
    "uploading"
  );

  const onUploadFile = async (file: File) => {
    try {
      setUploadStatus("uploading");
      await uploadFile(file, { id });
      removeRefFile(id);
      setUploadStatus("uploaded");
    } catch (error) {
      setUploadStatus("failed");
      onError(error);
    }
  };

  useEffect(() => {
    if (refFile) onUploadFile(refFile);
  }, [refFile]);

  return (
    <NodeViewWrapper as="span" className={styles.EditorAttachmentRenderer}>
      {refFile && uploadStatus !== "uploaded" && (
        <Card withBorder p={5} component="span" w="max-content">
          <Group gap="xs" pr="xs">
            <ThemeIcon color="gray" variant="light">
              <IconPaperclip size={14} />
            </ThemeIcon>

            <Group gap="xs" align="center">
              <Text fz="xs" fw={500} truncate maw={220} style={{ marginBottom: 0 }}>
                {refFile.name}
              </Text>

              {uploadStatus === "uploading" && <Loader size="xs" color="gray.3" type="oval" />}
            </Group>
          </Group>
        </Card>
      )}

      {(uploadStatus === "uploaded" || !refFile) && <AttachmentFile fileId={id} />}
    </NodeViewWrapper>
  );
};
