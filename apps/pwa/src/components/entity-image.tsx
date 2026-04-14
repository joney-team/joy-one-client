"use client";

import { FileType } from "@/graphql/enums.graphql";
import { renderFileUrl } from "@/modules/files/files-utils";
// import { ModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { ModalFilesViewerRef } from "@/modules/files/modals/modal-files-viewer";
import { nonLoading } from "@/utils/non-loading";
import { ActionIcon, Card, Center, Group, Image, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { Icon, IconPhoto, IconProps, IconUpload, IconZoomScan } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useRef, useState } from "react";
import { Renderer } from "./renderer";

const ModalFileGallery = dynamic(
  () => import("@/modules/files/modals/modal-files-viewer").then((mod) => mod.ModalFilesViewer),
  { ssr: false, loading: nonLoading },
);

interface EntityImageProps {
  src?: string | File | null;
  onChange?: (image: File) => void;
  readonly?: boolean;
  icon?: Icon;
  iconProps?: IconProps;
  h?: number | string;
  w?: number | string;
  size?: number | string;
  fit?: React.CSSProperties["objectFit"] | undefined;
  name?: string;
  onView?: () => void;
  radius?: number;
}

export const EntityImage: FC<EntityImageProps> = (props) => {
  const hover = useHover();
  const disabled = props.readonly || !props.onChange;
  const w = props.w || props.size || 100;
  const h = props.h || props.size || 100;
  const src = props.src instanceof File ? URL.createObjectURL(props.src) : renderFileUrl(props.src);
  const Icon = props.icon || IconPhoto;
  const size = typeof h === "number" ? h * 0.5 : h;
  const openRef = useRef<() => void>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const modalFileGalleryRef = useRef<ModalFilesViewerRef>(null);

  const ableView = !!props.src && !loadFailed;
  const hovered = hover.hovered && (ableView || !props.readonly);
  const radius = props.radius ?? 10;

  const onView = () => {
    if (props.onView) return props.onView();
    if (!src) return;
    modalFileGalleryRef.current?.open({
      files: [{ url: src, fileName: props.name || "image", type: FileType.Photo }],
      disabled: true,
    });
  };

  const onChange = () => {
    if (disabled) return;
    openRef.current?.();
  };

  return (
    <Dropzone
      accept={IMAGE_MIME_TYPE}
      onDrop={(files) => props.onChange && props.onChange(files[0])}
      disabled={disabled}
      multiple={false}
      openRef={openRef}
      activateOnClick={false}
    >
      <Card
        id="EntityImage"
        ref={hover.ref}
        p={0}
        bg="gray.1"
        maw="100%"
        mah="100%"
        h={h}
        w={w}
        pos="relative"
        radius={radius}
        style={{
          cursor: disabled || !src ? "default" : "pointer",
          overflow: "hidden",
        }}
        onClick={onView}
        withBorder
        shadow="none"
        component="div"
      >
        <Image
          src={src}
          h="100%"
          w="100%"
          fit={props.fit || "cover"}
          flex={1}
          onError={() => setLoadFailed(true)}
          onLoad={() => setLoadFailed(false)}
          style={{
            display: ableView ? "block" : "none",
          }}
        />

        <Renderer visible={!ableView}>
          <Center h="100%">
            <ThemeIcon size={size} color="gray.5" variant="transparent">
              <Icon strokeWidth={1.2} {...props.iconProps} />
            </ThemeIcon>
          </Center>
        </Renderer>

        <Renderer visible={hovered}>
          <Group
            gap={0}
            align="center"
            justify="center"
            bg="#00000098"
            px="xs"
            h="100%"
            w="100%"
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{
              borderRadius: radius,
            }}
            onClick={(e) => {
              if (disabled) {
                e.stopPropagation();
                onView();
              }
            }}
          >
            {src && (
              <ActionIcon size="lg" variant="subtle" color="white">
                <IconZoomScan size={20} />
              </ActionIcon>
            )}

            {!disabled && (
              <ActionIcon
                size="lg"
                variant="subtle"
                color="white"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange();
                }}
              >
                <IconUpload size={20} />
              </ActionIcon>
            )}
          </Group>
        </Renderer>
      </Card>

      <ModalFileGallery ref={modalFileGalleryRef} />
    </Dropzone>
  );
};
