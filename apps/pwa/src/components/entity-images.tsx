"use client";

import { useLayout } from "@/layout/layout-context";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { IconEye, IconUpload, IconX } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { Empty } from "./empty";
import { Image } from "./image";
import { Renderer } from "./renderer";
import { FileType } from "@/graphql/enums.graphql";

interface EntityImagesProps {
  name?: string;
  images?: (string | File)[];
  disabled?: boolean;
  onChange?: (images: (string | File)[]) => void;
  h?: number | string;
  w?: number | string;
  size?: number | string;
  fit?: React.CSSProperties["objectFit"] | undefined;
  length?: number;
  placeholder?: string;
}

export const EntityImages: FC<EntityImagesProps> = (props) => {
  const hover = useHover();
  const disabled = props.disabled || !props.onChange;
  const openRef = useRef<() => void>(null);
  const isHasImage = !!props.images?.length;
  const images = props.images || [];

  return (
    <Dropzone
      accept={IMAGE_MIME_TYPE}
      onDrop={(files) => props.onChange?.([...(props.images || []), ...files])}
      disabled={disabled}
      openRef={openRef}
      activateOnClick={false}
    >
      <Card
        ref={hover.ref}
        p={8}
        bg="var(--mantine-color-gray-outline-hover)"
        shadow="none"
        maw="100%"
        mah="100%"
        style={{ cursor: "pointer", position: "relative" }}
        onClick={() => openRef.current?.()}
      >
        <Renderer visible={images.length > 0}>
          <Group>
            {props.images?.map((src, i) => {
              return (
                <EntityImage
                  key={i}
                  {...props}
                  index={i}
                  imgSrc={src}
                  disabled={disabled}
                  onRemove={() => {
                    props.onChange?.(props.images!.filter((_, _i) => _i !== i));
                  }}
                />
              );
            })}
          </Group>
        </Renderer>

        <Empty visible={!!props.disabled && images.length === 0} message={t`No Images`} />

        <Renderer visible={!props.disabled}>
          <Group gap={5} justify="center" py={16} pb={isHasImage ? 5 : 15}>
            <ThemeIcon variant="transparent" color="gray">
              <IconUpload strokeWidth={1.5} size={18} />
            </ThemeIcon>
            <Text c="gray" fz={em(13)} fw={300}>
              {props.placeholder || <Trans>Drop file here or click</Trans>}
            </Text>
          </Group>
        </Renderer>
      </Card>
    </Dropzone>
  );
};

interface EntityImageProps extends EntityImagesProps {
  index: number;
  imgSrc: string | File;
  onRemove?: () => void;
}

const EntityImage: FC<EntityImageProps> = (props) => {
  const w = props.w || props.size || 150;
  const h = props.h || props.size || 100;
  const src = props.imgSrc;
  const hover = useHover();

  const onViewDetail = (e: any) => {
    e?.stopPropagation();
    OnModalFileGallery({
      files: props.images!.map((src) => ({
        fileName: `${props.name || "image"} ${props.index + 1}`,
        url: src instanceof File ? URL.createObjectURL(src) : (src as string),
        type: FileType.Photo,
      })),
      index: props.index,
      disabled: true,
    });
  };

  return (
    <Card
      ref={hover.ref}
      withBorder
      shadow="none"
      pos="relative"
      style={{ overflow: "hidden" }}
      w={w}
      h={h}
      p={0}
      onClick={onViewDetail}
    >
      <Renderer visible={hover.hovered}>
        <Stack
          gap={10}
          align="center"
          justify="center"
          bg="#00000098"
          h="100%"
          w="100%"
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
        >
          <Renderer visible={!props.disabled}>
            <Group gap={0} style={{ position: "absolute", top: 0, right: 0 }} p={2}>
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onRemove?.();
                }}
              >
                <IconX strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Group>
          </Renderer>

          <Group
            gap={0}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
            p={2}
          >
            <ActionIcon variant="subtle" color="white" onClick={onViewDetail}>
              <IconEye strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Renderer>

      <Image
        src={src instanceof File ? URL.createObjectURL(src) : src}
        h={h}
        w={w}
        fit={props.fit || "cover"}
        flex={1}
      />
    </Card>
  );
};
