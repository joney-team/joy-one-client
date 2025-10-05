import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { downloadFileFromURL, removeFile } from "@/modules/files/file-service";
import { FileEntity, FileType } from "@/modules/files/file-types";
import { parseFile, renderLink } from "@/modules/files/files-utils";
import { num, t } from "@/modules/lang/lang-service";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { ActionIcon, Anchor, em, Group, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrowser,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { useFileSize } from "../files-hooks";
import { formatBytes } from "@joy-one-client/utils/files";

interface ModalFileGalleryProps {
  files: FileEntity[] | { _id?: string; url: string; fileName?: string; type?: FileType }[];
  index?: number;
  readonly?: boolean;
  disabled?: boolean;
  onRemoved?: () => Promise<any> | any;
  background?: string;
}

export let OnModalFileGallery: (props: ModalFileGalleryProps) => void = () => {};

export const ModalFileGallery: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalFileGalleryProps>();
  const [index, setIndex] = useState<number>(0);
  const layout = useLayout();
  const head = 60;
  const activeFile = props?.files[index];
  const fileSize = useFileSize(renderLink(activeFile?.url));
  const disabled = props?.disabled || props?.readonly;

  OnModalFileGallery = (p) => {
    setIndex(p.index || 0);
    setProps(p);
    open();
  };

  const onNext = () => {
    if (!props) return;
    if (index + 1 >= props.files.length) return;
    setIndex(index + 1);
  };

  const onPrev = () => {
    if (index - 1 < 0) return;
    setIndex(index - 1);
  };

  useEffect(() => {
    if (opened) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") {
          onNext();
        } else if (event.key === "ArrowLeft") {
          onPrev();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [opened, onNext, onPrev, index]);

  if (!props || !activeFile) return null;

  const bodyHeight = layout.height - head;
  const _file = parseFile(activeFile.url);

  const onRemove = async () => {
    if (!activeFile || !activeFile._id) return;
    await removeFile(activeFile._id)
      .then(async () => {
        if (!props) return;
        const files = props.files.filter(
          (v) => typeof v === "object" && v._id !== activeFile._id
        ) as FileEntity[];
        await props?.onRemoved?.();
        if (files.length === 0) return close();
        setProps({ ...props, files });
      })
      .catch(onError);
  };

  const onDownload = async () => {
    if (!activeFile || typeof activeFile === "string") return;
    await onActionLoad({
      name: t("file_downloading"),
      process: () =>
        downloadFileFromURL(renderLink(activeFile.url), activeFile.fileName || _file.name),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      fullScreen={true}
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      zIndex={zIndexes.commonModals + 200}
    >
      <Group h={head} justify="space-between" px={16} bg="dark.7" wrap="nowrap" w="100%">
        <SimpleGrid cols={3} w="100%">
          <Group wrap="nowrap" gap={10}>
            <Text c="white" truncate="end" maw={layout.view === "mobile" ? "30dvw" : "40dvw"}>
              {_file.name}
            </Text>

            {fileSize.size && (
              <Text fz={12} c="gray">
                {formatBytes(fileSize.size)}
              </Text>
            )}
          </Group>

          <Group justify="center" wrap="nowrap" w="100%">
            <ActionIcon
              component="div"
              color={index === 0 ? "gray.8" : "white"}
              variant="transparent"
              onClick={onPrev}
            >
              <IconChevronLeft />
            </ActionIcon>
            <Text c="white">
              {num(index + 1)}/{num(props.files.length)}
            </Text>

            <ActionIcon
              component="div"
              color={index + 1 >= props.files.length ? "gray.8" : "white"}
              variant="transparent"
              onClick={onNext}
            >
              <IconChevronRight />
            </ActionIcon>
          </Group>

          <Group justify="end" wrap="nowrap" w="100%">
            <ActionIcon component="div" variant="subtle" color="white" onClick={onDownload}>
              <IconDownload strokeWidth={1.5} />
            </ActionIcon>

            {!disabled && (
              <ActionIcon component="div" variant="subtle" color="white" onClick={onRemove}>
                <IconTrash strokeWidth={1.5} />
              </ActionIcon>
            )}

            <ActionIcon component="div" variant="subtle" color="white" onClick={close}>
              <IconX strokeWidth={1.5} size={30} />
            </ActionIcon>
          </Group>
        </SimpleGrid>
      </Group>

      <Stack
        h={bodyHeight}
        w="100%"
        bg={props.background || "dark.4"}
        style={{ overflow: "hidden" }}
        align="center"
        justify="center"
        p={16}
      >
        {(function () {
          if (_file.type === FileType.PHOTO)
            return (
              <Image
                src={renderLink(activeFile.url)}
                w="100%"
                h="100%"
                maw="100%"
                mah="100%"
                fit="contain"
                className="shadowItem"
                styles={{
                  root: {
                    maxHeight: "100%",
                    maxWidth: "100%",
                  },
                }}
              />
            );

          return (
            <Stack justify="center" align="center">
              <Text fz={em(15)} c="white">
                {t("cannot_display_file")}
              </Text>

              <Anchor href={renderLink(activeFile.url)} target="__blank" c="white" ta="center">
                <Button rightSection={<IconBrowser strokeWidth={1.5} />}>
                  {t("open_with_browser")}
                </Button>
              </Anchor>
            </Stack>
          );
        })()}
      </Stack>
    </Modal>
  );
};
