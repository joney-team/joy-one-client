"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Image } from "@/components/image";
import { Modal } from "@/components/modal/modal";
import { FileType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { downloadFileFromURL } from "@/modules/files/file-service";
import { parseFile, renderFileUrl } from "@/modules/files/files-utils";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { useMutation, useQuery } from "@apollo/client/react";
import { zIndexes } from "@joy-one/config/layout";
import { formatBytes } from "@joy-one/utils/files";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Anchor, em, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBrowser,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { forwardRef, Fragment, ReactNode, useEffect, useImperativeHandle, useState } from "react";
import { useFileSize } from "../files-hooks";
import { FileFragment } from "../graphql/fragmentFile.graphql";
import GetFileByIdDocument from "../graphql/getFileById.graphql";
import RemoveFileDocument from "../graphql/removeFile.graphql";

const FilePdfViewer = dynamic(() => import("../file-pdf-viewer").then((mod) => mod.FilePdfViewer), {
  ssr: false,
  loading: nonLoading,
});

export interface ModalFilesViewerArgs {
  files: FileFragment[] | { url: string; _id?: string; fileName?: string; type?: FileType }[];
  index?: number;
  readonly?: boolean;
  disabled?: boolean;
  onRemoved?: () => Promise<any> | any;
  background?: string;
}

export interface ModalFilesViewerRef {
  open: (props: ModalFilesViewerArgs) => void;
  close: () => void;
}

export interface ModalFilesViewerProps {
  children?: (open: (args: ModalFilesViewerArgs) => void) => ReactNode;
}

export const ModalFilesViewer = forwardRef<ModalFilesViewerRef, ModalFilesViewerProps>(
  (props, ref) => {
    const { t } = useLingui();
    const [args, setArgs] = useState<ModalFilesViewerArgs | null>(null);
    const [index, setIndex] = useState<number>(0);
    const layout = useLayout();
    const head = 60;
    const activeFile = args?.files[index];
    const fileSize = useFileSize(renderFileUrl(activeFile?.url));
    const disabled = args?.disabled || args?.readonly;

    useImperativeHandle(ref, () => ({
      open: (p) => {
        if (p.index) setIndex(p.index);
        setArgs(p);
      },
      close: () => {
        onClose();
      },
    }));

    const [removeFile] = useMutation(RemoveFileDocument);

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

    const fileInfo = useQuery(GetFileByIdDocument, {
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
      await removeFile({ variables: { fileId: activeFile._id } })
        .then(async () => {
          if (!args) return;
          const files = args.files.filter(
            (v) => typeof v === "object" && v._id !== activeFile._id,
          ) as FileFragment[];
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
            activeFile.fileName || renderFile.name,
          ),
      });
    };

    return (
      <Fragment>
        {props.children?.((p) => {
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
                        {activeFile?.fileName ?? fileInfo.data?.file?.fileName ?? renderFile.name}
                      </Text>

                      {fileSize.size && (
                        <Text fz={12} c="gray">
                          {formatBytes(fileInfo.data?.file?.size ?? fileSize.size)}
                        </Text>
                      )}
                    </Group>
                  )}

                  <Group justify="center" wrap="nowrap" w="100%">
                    <ActionIcon
                      component="div"
                      color={index === 0 ? "dark.3" : "white"}
                      variant="subtle"
                      onClick={onPrev}
                    >
                      <IconChevronLeft />
                    </ActionIcon>

                    <Text c="white" ta="center" miw={60} fz="sm">
                      <NumberFormat value={index + 1} />/
                      {<NumberFormat value={args.files.length} />}
                    </Text>

                    <ActionIcon
                      component="div"
                      color={index + 1 >= args.files.length ? "dark.3" : "white"}
                      variant="subtle"
                      onClick={onNext}
                    >
                      <IconChevronRight />
                    </ActionIcon>
                  </Group>

                  <Group justify="end" wrap="nowrap" w="100%">
                    <ActionIcon component="div" variant="subtle" color="white" onClick={onDownload}>
                      <IconDownload strokeWidth={1.5} size={20} />
                    </ActionIcon>

                    {!disabled && (
                      <ActionIcon component="div" variant="subtle" color="white" onClick={onRemove}>
                        <IconTrash strokeWidth={1.5} size={20} />
                      </ActionIcon>
                    )}

                    <ActionIcon component="div" variant="subtle" color="white" onClick={onClose}>
                      <IconX strokeWidth={1.5} size={22} />
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
              >
                {(function () {
                  if (renderFile.type === FileType.Photo) {
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
                  }

                  if (renderFile.type === FileType.Pdf || activeFile.type === FileType.Pdf) {
                    return <FilePdfViewer file={activeFile} />;
                  }

                  if (renderFile.type === FileType.Video) {
                    return (
                      <video
                        src={renderFileUrl(activeFile.url)}
                        style={{ width: "100%", height: "100%", background: "black" }}
                        controls
                        autoPlay={false}
                      />
                    );
                  }

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
  },
);
