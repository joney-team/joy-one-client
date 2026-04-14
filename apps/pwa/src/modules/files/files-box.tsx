"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { detectFileType } from "@/modules/files/file-service";
import { type ModalFilesViewerRef } from "@/modules/files/modals/modal-files-viewer";
import { nonLoading } from "@/utils/non-loading";
import { useMutation, useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Card, CardProps, em, Group, Stack, StackProps, Text, ThemeIcon } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconUpload } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Renderer } from "../../components/renderer";
import { FileBoxCard } from "./files-box-card";
import { useUploadFile } from "./hooks/use-upload-file";

import { FileFragment } from "./graphql/fragmentFile.graphql";
import GetFilesDocument from "./graphql/getFiles.graphql";
import RemoveFileDocument from "./graphql/removeFile.graphql";

const ModalFileGallery = dynamic(
  () => import("@/modules/files/modals/modal-files-viewer").then((mod) => mod.ModalFilesViewer),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface FilesBoxProps {
  refs?: string[];
  rawFiles?: File[];
  onChangeRawFiles?: (files: File[]) => void;
  autoUpload?: boolean;
  placeholder?: string;
  filesWrapperProps?: StackProps;
  disabled?: boolean;
  readonly?: boolean;
  empty?: React.ReactNode;
  specificDisabledRelated?: string[];
  replace?: boolean;
  length?: number;
  itemCardProps?: CardProps;
  wrapperStyle?: React.CSSProperties;
}

export interface FilesBoxRef {
  add(files: File[]): Promise<any>;
}

export const FilesBox = forwardRef<FilesBoxRef, FilesBoxProps>((props, ref) => {
  const openRef = useRef<() => void>(null);
  const modalFileGalleryRef = useRef<ModalFilesViewerRef>(null);

  const [_rawFiles, setRawFiles] = useState<File[]>([]);
  const rawFiles = props.rawFiles || _rawFiles;
  const uploadFile = useUploadFile();
  const disabled = props.disabled || props.readonly;

  const onChangeRawFiles = (files: File[]) => {
    if (props.rawFiles) return props.onChangeRawFiles?.(files);
    setRawFiles(files);
  };

  const [removeFile] = useMutation(RemoveFileDocument);

  const { data: filesData, refetch } = useQuery(GetFilesDocument, {
    variables: {
      query: {
        refs: props.refs,
      },
    },
    fetchPolicy: "cache-and-network",
    skip: !props.refs,
  });

  const addFile = async (_fs: File[]) => {
    const _files = props.length ? _fs.slice(0, props.length) : _fs;

    if (props.autoUpload) {
      Promise.all(
        _files.map((file) => {
          return uploadFile(file, { refs: props.refs });
        }),
      ).then(() => refetch());
    } else {
      if (props.replace) {
        setRawFiles(_files);
        onChangeRawFiles(_files);
      } else {
        setRawFiles((s) => {
          onChangeRawFiles(_files);
          return [...s, ..._files];
        });
      }
    }
  };

  const onRemove = async (file: FileFragment | File) => {
    if (file instanceof File) {
      setRawFiles((s) => {
        const _data = s.filter((v) => v !== file);
        onChangeRawFiles(_data);
        return _data;
      });
    } else {
      await removeFile({ variables: { fileId: file._id } });
      refetch();
    }
  };

  useEventsListener([EventType.FileNew, EventType.FileRemoved], () => refetch());

  const length = filesData?.list.results.length ?? 0 + rawFiles.length;

  useImperativeHandle(
    ref,
    (): FilesBoxRef => ({
      add: async (_files) => addFile(_files),
    }),
  );

  return (
    <Dropzone
      disabled={disabled}
      openRef={openRef}
      onDrop={(_files) => addFile(_files)}
      style={{ outline: "none" }}
      activateOnClick={false}
    >
      <Card
        withBorder
        shadow="none"
        p={0}
        onClick={() => openRef.current?.()}
        bg={length > 0 ? "var(--mantine-color-gray-outline-hover)" : "transparent"}
        style={{
          position: "relative",
          cursor: "pointer",
          borderStyle: length > 0 ? "solid" : "dashed",
          ...props.wrapperStyle,
        }}
      >
        <Stack
          p={8}
          gap={8}
          style={{ borderRadius: 8, position: "relative" }}
          {...props.filesWrapperProps}
        >
          <Renderer visible={length > 0}>
            <Group gap={10}>
              {filesData?.list.results.map((file, index) => {
                const specificDisabled = props.specificDisabledRelated?.find(
                  (v) => !!(file as any)[v],
                );

                return (
                  <FileBoxCard
                    key={file._id}
                    file={file}
                    disabled={disabled || !!specificDisabled}
                    onRemove={() => onRemove(file)}
                    onGallery={() =>
                      modalFileGalleryRef.current?.open({
                        files: filesData?.list.results ?? [],
                        index,
                        disabled: props.disabled,
                      })
                    }
                    cardProps={props.itemCardProps}
                  />
                );
              })}

              {rawFiles.map((file, index) => {
                return (
                  <FileBoxCard
                    disabled={disabled}
                    key={index}
                    file={file}
                    onRemove={() => onRemove(file)}
                    cardProps={props.itemCardProps}
                    onGallery={() => {
                      const rawFileEntity: FileFragment = {
                        __typename: "File",
                        _id: "",
                        fileName: file.name,
                        type: detectFileType(file.name),
                        url: URL.createObjectURL(file),
                        createdAt: DateTime.getNowInSeconds(),
                        relativePath: "",
                        size: file.size,
                        path: "",
                        ref: "",
                        refs: [],
                        thumbnail: null,
                        updatedAt: null,
                        uploadByUserId: null,
                      };

                      modalFileGalleryRef.current?.open({
                        files: [rawFileEntity],
                        disabled: props.disabled,
                      });
                    }}
                  />
                );
              })}
            </Group>
          </Renderer>

          <Renderer visible={length === 0 && !!props.empty}>{props.empty}</Renderer>

          <Renderer visible={!disabled}>
            <Dropzone.Accept>
              <Group gap={5} justify="center" py={5} pb={length > 0 ? 0 : 5}>
                <ThemeIcon variant="transparent" color="gray.5">
                  <IconUpload strokeWidth={1.5} size={18} />
                </ThemeIcon>
                <Text c="gray.5" fz={em(13)} fw={300}>
                  {props.placeholder ?? <Trans>Drop files here</Trans>}
                </Text>
              </Group>
            </Dropzone.Accept>

            <Dropzone.Idle>
              <Group gap={5} justify="center" py={5} pb={length > 0 ? 0 : 5}>
                <ThemeIcon variant="transparent" color="gray.5">
                  <IconUpload strokeWidth={1.5} size={18} />
                </ThemeIcon>
                <Text c="gray.5" fz={em(13)} fw={300}>
                  {props.placeholder ?? <Trans>Drop or click to choose file</Trans>}
                </Text>
              </Group>
            </Dropzone.Idle>
          </Renderer>
        </Stack>
      </Card>

      <ModalFileGallery ref={modalFileGalleryRef} />
    </Dropzone>
  );
});
