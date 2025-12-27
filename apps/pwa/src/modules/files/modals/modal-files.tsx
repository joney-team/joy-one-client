"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { numberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { Modal } from "@/components/modal/modal";
import { WayPoint } from "@/components/way-point";
import { configs } from "@/configs/layout.config";
import { FileType } from "@/graphql/types.graphql";
import { useLayout } from "@/layout/layout-context";
import { FileEntity } from "@/modules/files/file-types";
import { InternalFileCard } from "@/modules/files/internal-file-card";
import { ModalFileGallery, ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { Trans } from "@lingui/react/macro";
import { Box, Card, em, Group, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconCheck, IconPhotoSquareRounded, IconUpload } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useRef, useState } from "react";
import { getFiles, getMineTypeAccept } from "../file-service";
import { useUploadFile } from "../hooks/use-upload-file";

export interface ModalFilesArgs {
  fileTypes?: FileType[];
  length?: number;
  onSelectedFiles: (files: Pick<FileEntity, "_id" | "type" | "path">[]) => void;
}

export interface ModalFilesProps {
  children?: (open: (args: ModalFilesArgs) => void) => ReactNode;
}

export interface ModalFilesRef {
  open: (args: ModalFilesArgs) => void;
  close: () => void;
}

export const ModalFiles = forwardRef<ModalFilesRef, ModalFilesProps>((props, ref) => {
  const layout = useLayout();
  const colorScheme = useColorScheme();
  const uploadFile = useUploadFile();
  const modalFileGalleryRef = useRef<ModalFileGalleryRef | null>(null);

  const [args, setArgs] = useState<ModalFilesArgs | null>(null);
  const files = useList({ fetch: (q) => getFiles({ ...q, strict: true }) });

  const [_selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectedFiles = _selectedFiles
    .map((v) => files.data.find((f) => f._id === v))
    .filter((v) => !!v) as FileEntity[];

  const onClose = () => setArgs(null);

  const toggleSeleteFile = (file: Pick<FileEntity, "type" | "_id" | "url" | "path">) => {
    if (!args || (args.fileTypes && !args.fileTypes.includes(file.type))) return;

    if (_selectedFiles?.includes(file._id)) {
      // Un select file
      setSelectedFiles((s) => s?.filter((v) => v !== file._id));
    } else {
      // Select file
      if (args.length === 1) {
        args.onSelectedFiles([file]);
        return onClose();
      }

      if (args.length && _selectedFiles.length >= args.length) return setSelectedFiles([file._id]);
      setSelectedFiles((s) => [...s, file._id]);
    }
  };

  const onSelected = () => {
    if (!args) return;
    if (args.onSelectedFiles) {
      const _selected = _selectedFiles
        .map((v) => files.data.find((f) => f._id === v))
        .filter((v) => !!v) as FileEntity[];
      args.onSelectedFiles(_selected);
      onClose();
    }
  };

  useImperativeHandle(ref, () => ({
    open: (p) => setArgs(p),
    close: onClose,
  }));

  return (
    <Fragment>
      {typeof props.children === "function" &&
        props.children((inArgs) => {
          setSelectedFiles([]);
          setArgs(inArgs);
        })}

      <Modal
        size={1200}
        yOffset={10}
        zIndex={300}
        opened={!!args}
        onClose={onClose}
        name={<Trans>Files</Trans>}
        icon={IconPhotoSquareRounded}
        isFullscreenOnMobile
      >
        <Stack>
          <Box
            style={{ overflow: "auto", height: layout.height - 250, borderRadius: 10 }}
            bg={configs.backgroundColors[colorScheme]}
            id="files-list"
          >
            <Stack gap={0} p={16}>
              <SimpleGrid cols={layout.view === "mobile" ? 2 : layout.view === "tablet" ? 4 : 6}>
                {files.data.map((file, index) => {
                  return (
                    <InternalFileCard
                      file={file}
                      key={file._id}
                      isActive={_selectedFiles.includes(file._id)}
                      onClick={() => toggleSeleteFile(file)}
                      disabled={
                        args?.fileTypes &&
                        args?.fileTypes?.length > 0 &&
                        !args.fileTypes.includes(file.type)
                      }
                      onDoubleClick={() =>
                        modalFileGalleryRef.current?.open({
                          files: files.data,
                          index,
                          onRemoved: () => files.fetch(true, { isSilient: true }),
                        })
                      }
                    />
                  );
                })}
              </SimpleGrid>

              <WayPoint
                enabled={files.isAbleToLoadMore}
                scrollContainerId="files-list"
                offset={100}
                onReached={files.loadMore}
              />
            </Stack>
          </Box>

          <Group justify="space-between">
            <Dropzone
              flex={1}
              accept={args?.fileTypes && getMineTypeAccept(args?.fileTypes)}
              onDrop={async (_files) => {
                for (const file of _files) {
                  const uploadedFile = await uploadFile(file);
                  await files.fetch(true, { isSilient: true });
                  toggleSeleteFile(uploadedFile);
                }
              }}
            >
              <Card
                withBorder
                shadow="none"
                className="clickable"
                style={{ borderStyle: "dashed" }}
              >
                <Group gap={10} justify="center">
                  <ThemeIcon variant="transparent" color="dark">
                    <IconUpload strokeWidth={1.5} />
                  </ThemeIcon>
                  <Text fz={em(13)}>
                    <Trans>Drop or click to choose file</Trans>
                  </Text>
                </Group>
              </Card>
            </Dropzone>

            <Button
              type="submit"
              disabled={selectedFiles.length <= 0}
              miw={200}
              fullWidth={layout.view === "mobile"}
              onClick={onSelected}
              leftIcon={IconCheck}
            >
              <Group>
                <Trans>Complete</Trans>
                {selectedFiles.length > 0 && (
                  <Circle color="white" c="primary" label={numberFormat(selectedFiles.length)} />
                )}
              </Group>
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ModalFileGallery ref={modalFileGalleryRef} />
    </Fragment>
  );
});
