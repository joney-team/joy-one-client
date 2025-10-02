"use client";

import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import {
  detectFileType,
  getFiles,
  onUploadWorkspaceFile,
  removeFile,
} from "@/modules/files/file-service";
import { FileEntity, FileType } from "@/modules/files/file-types";
import { renderLink } from "@/modules/files/files-utils";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { t } from "@/modules/lang/lang-service";
import { AppEntity } from "@/types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { useList } from "@/components/list/use-list";
import {
  ActionIcon,
  BoxProps,
  Card,
  CardProps,
  Center,
  em,
  Group,
  Stack,
  StackProps,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { IconArrowsDiagonal, IconFile, IconUpload, IconVideo, IconX } from "@tabler/icons-react";
import { FC, forwardRef, Fragment, useImperativeHandle, useRef, useState } from "react";
import { Image } from "../../components/image";
import { Renderer } from "../../components/renderer";

interface FilesBoxProps {
  query?: {
    relatedCustomerId?: string;
    relatedTicketId?: string;
    relatedTaskId?: string;
    relatedReceiptId?: string;
    relatedHrmTimekeepingId?: string;
    ref?: string;
    entity?: AppEntity;
    entityId?: string;
  };
  rawFiles?: File[];
  onChangeRawFiles?: (files: File[]) => void;
  autoUpload?: boolean;
  placeholder?: string;
  filesWrapperProps?: StackProps;
  disabled?: boolean;
  empty?: React.ReactNode;
  specificDisabledRelated?: string[];
  replace?: boolean;
  length?: number;
  itemCardProps?: CardProps;
  props?: BoxProps;
  wrapperStyle?: React.CSSProperties;
}

export interface FilesBoxRef {
  add(files: File[]): Promise<any>;
}

export const FilesBox = forwardRef<FilesBoxRef, FilesBoxProps>((props, ref) => {
  const openRef = useRef<() => void>(null);
  const [_rawFiles, setRawFiles] = useState<File[]>([]);
  const rawFiles = props.rawFiles || _rawFiles;

  const onChangeRawFiles = (files: File[]) => {
    if (props.rawFiles) return props.onChangeRawFiles?.(files);
    setRawFiles(files);
  };

  const uploadedFiles = useList({
    autoFetch: !!props.query,
    id: `uploaded-files-${JSON.stringify(props.query || {})}`,
    fetch: (p) => {
      if (!props.query) return { count: 0, data: [] };
      return getFiles({ ...props.query, ...p, strictRelated: true });
    },
  });

  const addFile = async (_fs: File[]) => {
    const _files = props.length ? _fs.slice(0, props.length) : _fs;

    if (props.autoUpload) {
      Promise.all(
        _files.map((file) => {
          const { entity, entityId, ...rest } = props.query || {};
          const relatedEntities = entity && entityId ? [{ id: entityId, entity }] : [];

          return onUploadWorkspaceFile({ file, relatedEntities, ...rest });
        })
      ).then(() => uploadedFiles.fetch(true, { isSilient: true }));
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

  const onRemove = async (file: FileEntity | File) => {
    if (file instanceof File) {
      setRawFiles((s) => {
        const _data = s.filter((v) => v !== file);
        onChangeRawFiles(_data);
        return _data;
      });
    } else {
      await removeFile(file._id);
      uploadedFiles.fetch(true, { isSilient: true });
    }
  };

  useEventsListener([EventType.FILE_NEW, EventType.FILE_REMOVED], () =>
    uploadedFiles.fetch(true, { isSilient: true })
  );

  const length = uploadedFiles.data.length + rawFiles.length;

  useImperativeHandle(
    ref,
    (): FilesBoxRef => ({
      add: async (_files) => addFile(_files),
    })
  );

  return (
    <Dropzone
      onDrop={(_files) => addFile(_files)}
      disabled={props.disabled}
      activateOnClick={false}
      openRef={openRef}
      {...props.props}
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
              {uploadedFiles.data.map((file, index) => {
                const specificDisabled = props.specificDisabledRelated?.find(
                  (v) => !!(file as any)[v]
                );

                return (
                  <FileBoxCard
                    key={file._id}
                    file={file}
                    disabled={props.disabled || !!specificDisabled}
                    onRemove={() => onRemove(file)}
                    onGallery={() =>
                      OnModalFileGallery({
                        files: uploadedFiles.data,
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
                    disabled={props.disabled}
                    key={index}
                    file={file}
                    onRemove={() => onRemove(file)}
                    cardProps={props.itemCardProps}
                  />
                );
              })}
            </Group>
          </Renderer>

          <Renderer visible={length === 0 && !!props.empty}>{props.empty}</Renderer>

          <Renderer visible={!props.disabled}>
            <Dropzone.Accept>
              <Group gap={5} justify="center" py={5} pb={length > 0 ? 0 : 5}>
                <ThemeIcon variant="transparent" color="gray.5">
                  <IconUpload strokeWidth={1.5} size={18} />
                </ThemeIcon>
                <Text c="gray.5" fz={em(13)} fw={300}>
                  {props.placeholder || t("drop_file_here")}
                </Text>
              </Group>
            </Dropzone.Accept>

            <Dropzone.Idle>
              <Group gap={5} justify="center" py={5} pb={length > 0 ? 0 : 5}>
                <ThemeIcon variant="transparent" color="gray.5">
                  <IconUpload strokeWidth={1.5} size={18} />
                </ThemeIcon>
                <Text c="gray.5" fz={em(13)} fw={300}>
                  {props.placeholder || t("drop_file_here_or_click")}
                </Text>
              </Group>
            </Dropzone.Idle>
          </Renderer>
        </Stack>
      </Card>
    </Dropzone>
  );
});

export const FileBoxCard: FC<{
  file: File | FileEntity;
  onRemove?: () => void;
  disabled?: boolean;
  onGallery?: () => void;
  cardProps?: CardProps;
}> = (props) => {
  const { file } = props;
  const fileType = detectFileType(file instanceof File ? file.name : file.fileName);
  const fileName = file instanceof File ? file.name : file.fileName;
  const hover = useHover();
  const radius = 5;

  return (
    <Card
      withBorder
      shadow="none"
      w={150}
      p={5}
      style={{ position: "relative", overflow: "visible", cursor: "pointer" }}
      ref={hover.ref}
      {...props.cardProps}
    >
      <Stack w="100%" mih="100%" gap={5}>
        <Stack mih="100%" style={{ position: "relative" }}>
          {(function () {
            const url = file instanceof File ? URL.createObjectURL(file) : renderLink(file.url);

            if (fileType === FileType.PHOTO)
              return (
                <Image
                  src={url}
                  w="100%"
                  h={100}
                  mih={100}
                  mah={100}
                  fit="contain"
                  bg="gray.1"
                  style={{ borderTopRightRadius: radius, borderTopLeftRadius: radius }}
                />
              );

            if (fileType === FileType.VIDEO)
              return (
                <Fragment>
                  <video
                    src={url}
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f1f1f1",
                    }}
                    autoPlay={false}
                  />

                  <Center
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 2,
                      width: "100%",
                      height: 100,
                      backgroundColor: "#f1f1f1",
                    }}
                  >
                    <ThemeIcon color="gray" variant="transparent" size="lg">
                      <IconVideo strokeWidth={1.2} />
                    </ThemeIcon>
                  </Center>
                </Fragment>
              );

            return (
              <Center
                style={{
                  height: 100,
                  backgroundColor: "#f1f1f1",
                }}
              >
                <ThemeIcon color="gray" variant="transparent" size="lg">
                  <IconFile strokeWidth={1.2} />
                </ThemeIcon>
              </Center>
            );
          })()}

          {hover.hovered && (
            <Stack
              justify="center"
              align="center"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                top: 0,
                left: 0,
                borderTopRightRadius: radius,
                borderTopLeftRadius: radius,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (props.onGallery) return props.onGallery();

                if (file instanceof File) {
                  const _file: FileEntity = {
                    fileName: file.name,
                    type: detectFileType(file.name),
                    url: URL.createObjectURL(file),
                    _id: "",
                    createdAt: DateTimeUtils.timeToSeconds(),
                    relativePath: "",
                    size: file.size,
                    path: "",
                  };
                  OnModalFileGallery({ files: [_file], disabled: props.disabled });
                } else {
                  OnModalFileGallery({ files: [file], disabled: props.disabled });
                }
              }}
            >
              <ThemeIcon color="white" variant="transparent" size="sm">
                <IconArrowsDiagonal />
              </ThemeIcon>
            </Stack>
          )}
        </Stack>

        <Text ta="center" truncate="end" fz={em(10)} fw={500}>
          {fileName}
        </Text>
      </Stack>

      <Renderer visible={!props.disabled && hover.hovered}>
        <ActionIcon
          color="dark.3"
          size="xs"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
          radius={100}
          onClick={(e) => {
            e.stopPropagation();
            props.onRemove?.();
          }}
        >
          <IconX strokeWidth={2} size={12} />
        </ActionIcon>
      </Renderer>
    </Card>
  );
};
