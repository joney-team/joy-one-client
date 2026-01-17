"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Image } from "@/components/image";
import { Modal } from "@/components/modal/modal";
import { FileType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { downloadFileFromURL, removeFile } from "@/modules/files/file-service";
import { FileEntity } from "@/modules/files/file-types";
import { parseFile, renderFileUrl } from "@/modules/files/files-utils";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { useQuery } from "@apollo/client/react";
import { zIndexes } from "@joy-one-client/config/layout";
import { formatBytes } from "@joy-one-client/utils/files";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Anchor, em, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBrowser,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useEffect, useImperativeHandle, useState } from "react";
import { useFileSize } from "../files-hooks";
import QUERY_FILE_INFO, {
  type GetFileInfoQuery,
  type GetFileInfoQueryVariables,
} from "./queryFileInfo.graphql";

export interface ModalFileGalleryArgs {
  files: FileEntity[] | { _id?: string; url: string; fileName?: string; type?: FileType }[];
  index?: number;
  readonly?: boolean;
  disabled?: boolean;
  onRemoved?: () => Promise<any> | any;
  background?: string;
}

export interface ModalFileGalleryRef {
  open: (props: ModalFileGalleryArgs) => void;
  close: () => void;
}

export interface ModalFileGalleryProps {
  children?: (open: (args: ModalFileGalleryArgs) => void) => ReactNode;
}

export const ModalFileGallery = forwardRef<ModalFileGalleryRef, ModalFileGalleryProps>(
  (props, ref) => {
    const [args, setArgs] = useState<ModalFileGalleryArgs | null>(null);
    const [index, setIndex] = useState<number>(0);
    const layout = useLayout();
    const head = 60;
    const activeFile = args?.files[index];
    const fileSize = useFileSize(renderFileUrl(activeFile?.url));
    const disabled = args?.disabled || args?.readonly;

    const onClose = () => {
      setArgs(null);
    };

    const onNext = () => {
      if (!args) return;
      if (index + 1 >= args.files.length) return;
      setIndex(index + 1);
    };

    const onPrev = () => {
      if (index - 1 < 0) return;
      setIndex(index - 1);
    };

    const bodyHeight = layout.height - head;
    const renderFile = parseFile(activeFile?.url || "");

    const fileInfo = useQuery<GetFileInfoQuery, GetFileInfoQueryVariables>(QUERY_FILE_INFO, {
      skip: !renderFile.fileId,
      variables: { fileId: renderFile.fileId || "" },
    });

    useEffect(() => {
      if (args) {
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
    }, [args, onNext, onPrev, index]);

    const onRemove = async () => {
      if (!activeFile || !activeFile._id) return;
      await removeFile(activeFile._id)
        .then(async () => {
          if (!args) return;
          const files = args.files.filter(
            (v) => typeof v === "object" && v._id !== activeFile._id
          ) as FileEntity[];
          await args?.onRemoved?.();
          if (files.length === 0) return onClose();
          setArgs({ ...args, files });
        })
        .catch(onError);
    };

    const onDownload = async () => {
      if (!activeFile || typeof activeFile === "string") return;
      await onActionLoad({
        name: t`File downloading`,
        process: () =>
          downloadFileFromURL(
            renderFileUrl(activeFile.url),
            activeFile.fileName || renderFile.name
          ),
      });
    };

    useImperativeHandle(ref, () => ({
      open: (p) => {
        setArgs(p);
      },
      close: () => {
        onClose();
      },
    }));

    return (
      <Fragment>
        {props.children &&
          typeof props.children === "function" &&
          props.children((p) => {
            setIndex(p.index || 0);
            setArgs(p);
          })}

        <Modal
          opened={!!args}
          onClose={onClose}
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
          {args && activeFile && (
            <Fragment>
              <Group h={head} justify="space-between" px={16} bg="dark.7" wrap="nowrap" w="100%">
                <SimpleGrid cols={3} w="100%">
                  {fileInfo.loading ? (
                    <Loader size={28} type="dots" color="white" />
                  ) : (
                    <Group wrap="nowrap" gap={10}>
                      <Text
                        c="white"
                        truncate="end"
                        maw={layout.view === "mobile" ? "30dvw" : "40dvw"}
                      >
                        {activeFile?.fileName ??
                          fileInfo.data?.getFileInfo?.fileName ??
                          renderFile.name}
                      </Text>

                      {fileSize.size && (
                        <Text fz={12} c="gray">
                          {formatBytes(fileInfo.data?.getFileInfo?.size ?? fileSize.size)}
                        </Text>
                      )}
                    </Group>
                  )}

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
                      <NumberFormat value={index + 1} />/
                      {<NumberFormat value={args.files.length} />}
                    </Text>

                    <ActionIcon
                      component="div"
                      color={index + 1 >= args.files.length ? "gray.8" : "white"}
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

                    <ActionIcon
                      component="div"
                      variant="subtle"
                      color="white"
                      onClick={() => onClose()}
                    >
                      <IconX strokeWidth={1.5} size={30} />
                    </ActionIcon>
                  </Group>
                </SimpleGrid>
              </Group>

              <Stack
                h={bodyHeight}
                w="100%"
                bg={args.background || "dark.4"}
                style={{ overflow: "hidden" }}
                align="center"
                justify="center"
                p={16}
              >
                {(function () {
                  if (renderFile.type === FileType.Photo)
                    return (
                      <Image
                        src={renderFileUrl(activeFile.url)}
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
                        <Trans>Cannot display file</Trans>
                      </Text>

                      <Anchor
                        href={renderFileUrl(activeFile.url)}
                        target="__blank"
                        c="white"
                        ta="center"
                      >
                        <Button rightSection={<IconBrowser strokeWidth={1.5} />}>
                          <Trans>Open with browser</Trans>
                        </Button>
                      </Anchor>
                    </Stack>
                  );
                })()}
              </Stack>
            </Fragment>
          )}
        </Modal>
      </Fragment>
    );
  }
);
