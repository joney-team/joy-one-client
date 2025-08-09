"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { ModalTitle } from "@/components/modal-title";
import { WayPoint } from "@/components/way-point";
import { configs } from "@/configs/layout.config";
import { useLayout } from "@/layout/layout-context";
import { FileCard } from "@/modules/files/file-card";
import { FileEntity, FileType } from "@/modules/files/file-types";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { num, t } from "@/modules/lang/lang-service";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { useList } from "@/utils/use-list.util";
import { Box, Card, em, Group, Modal, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconPhotoSquareRounded, IconUpload } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { getFiles, getMineTypeAccept, onUploadFile } from "../file-service";

interface ModalFilesState {
  fileTypes?: FileType[];
  length?: number;
  onSelectedFiles: (files: FileEntity[]) => void;
}

export let OnModalFiles: (state: ModalFilesState) => void = () => {};

export const ModalFiles: FC = () => {
  const viewport = useLayout();
  const colorScheme = useColorScheme();

  const state = useRef<ModalFilesState | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const files = useList({ fetch: (q) => getFiles({ ...q, strict: true }) });

  const [_selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectedFiles = _selectedFiles
    .map((v) => files.data.find((f) => f._id === v))
    .filter((v) => !!v) as FileEntity[];

  OnModalFiles = (s) => {
    state.current = s;
    setSelectedFiles([]);
    open();
  };

  const toggleSeleteFile = (file: FileEntity) => {
    if (!state.current || (state.current.fileTypes && !state.current.fileTypes.includes(file.type)))
      return;

    if (_selectedFiles?.includes(file._id)) {
      // Un select file
      setSelectedFiles((s) => s?.filter((v) => v !== file._id));
    } else {
      // Select file
      if (state.current.length === 1) {
        state.current.onSelectedFiles([file]);
        return close();
      }

      if (state.current.length && _selectedFiles.length >= state.current.length)
        return setSelectedFiles([file._id]);
      setSelectedFiles((s) => [...s, file._id]);
    }
  };

  const onSelected = () => {
    if (!state.current) return;
    if (state.current.onSelectedFiles) {
      const _selected = _selectedFiles
        .map((v) => files.data.find((f) => f._id === v))
        .filter((v) => !!v) as FileEntity[];
      state.current.onSelectedFiles(_selected);
      close();
    }
  };

  return (
    <Modal
      size={1400}
      yOffset={10}
      zIndex={300}
      opened={opened}
      onClose={close}
      title={<ModalTitle title={t("files")} icon={IconPhotoSquareRounded} />}
      fullScreen={viewport.view === "mobile"}
    >
      <Stack>
        <Box
          style={{ overflow: "auto", height: viewport.height - 250, borderRadius: 10 }}
          bg={configs.backgroundColors[colorScheme]}
          id="files-list"
        >
          <Stack gap={0} p={16}>
            <SimpleGrid cols={viewport.view === "mobile" ? 2 : viewport.view === "tablet" ? 4 : 6}>
              {files.data.map((file, index) => {
                return (
                  <FileCard
                    file={file}
                    key={file._id}
                    isActive={_selectedFiles.includes(file._id)}
                    onClick={() => toggleSeleteFile(file)}
                    disabled={
                      state.current?.fileTypes &&
                      state.current?.fileTypes?.length > 0 &&
                      !state.current.fileTypes.includes(file.type)
                    }
                    onDoubleClick={() =>
                      OnModalFileGallery({
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
            accept={state.current?.fileTypes && getMineTypeAccept(state.current?.fileTypes)}
            onDrop={(_files) => {
              _files.map((file) => {
                onUploadFile({ file }, async (file) => {
                  await files.fetch(true, { isSilient: true });
                  toggleSeleteFile(file);
                });
              });
            }}
          >
            <Card withBorder shadow="none" className="clickable" style={{ borderStyle: "dashed" }}>
              <Group gap={10} justify="center">
                <ThemeIcon variant="transparent" color="dark">
                  <IconUpload strokeWidth={1.5} />
                </ThemeIcon>
                <Text fz={em(13)}>{t("drop_file_here_or_click")}</Text>
              </Group>
            </Card>
          </Dropzone>

          <Button
            type="submit"
            disabled={selectedFiles.length <= 0}
            miw={200}
            fullWidth={viewport.view === "mobile"}
            onClick={onSelected}
            leftIcon={IconCheck}
          >
            <Group>
              {t("complete")}
              {selectedFiles.length > 0 && (
                <Circle color="white" c="primary" label={num(selectedFiles.length)} />
              )}
            </Group>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
