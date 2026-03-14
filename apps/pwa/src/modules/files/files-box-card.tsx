"use client";

import AspectRatio from "@/components/aspect-ratio/aspect-ratio";
import { FileType } from "@/graphql/enums.graphql";
import { detectFileType } from "@/modules/files/file-service";
import { renderFileUrl } from "@/modules/files/files-utils";
import { ActionIcon, Card, CardProps, Center, em, Stack, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconArrowsDiagonal, IconX } from "@tabler/icons-react";
import { FC, useMemo } from "react";
import { Renderer } from "../../components/renderer";
import { useColor } from "../theme/use-color";
import { fileTypes } from "./files-constants";
import { FileDataFragment } from "./graphql/fragmentFile.graphql";

export const FileBoxCard: FC<{
  file: File | FileDataFragment;
  onRemove?: () => void;
  disabled?: boolean;
  onGallery: () => void;
  cardProps?: CardProps;
}> = (props) => {
  const { file } = props;
  const color = useColor();
  const fileType = detectFileType(file instanceof File ? file.name : file.fileName);
  const fileName = file instanceof File ? file.name : file.fileName;
  const hover = useHover();
  const radius = 5;

  const thumbnail = useMemo(() => {
    const url = file instanceof File ? URL.createObjectURL(file) : renderFileUrl(file.url);
    const { icon: Icon } = fileTypes[fileType];

    if (fileType === FileType.Photo) {
      return (
        <AspectRatio
          ratio={4 / 3}
          style={{
            backgroundImage: `url("${url}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      );
    }

    if (fileType === FileType.Video) {
      return (
        <AspectRatio
          ratio={4 / 3}
          style={{ background: color({ light: "dark.3", dark: "dark.7" }) }}
        >
          <video
            src={url}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            autoPlay={false}
          />
        </AspectRatio>
      );
    }

    return (
      <AspectRatio ratio={4 / 3}>
        <Center w="100%" h="100%" bg={color({ light: "dark.3", dark: "dark.7" })}>
          <ThemeIcon color="white" variant="transparent" size="lg">
            <Icon strokeWidth={1.2} />
          </ThemeIcon>
        </Center>
      </AspectRatio>
    );
  }, [fileType, color]);

  return (
    <Card
      withBorder
      shadow="none"
      w={150}
      p={5}
      pos="relative"
      ref={hover.ref}
      onClick={(e) => e.stopPropagation()}
      {...props.cardProps}
    >
      <Stack w="100%" mih="100%" gap={5}>
        <Stack mih="100%" pos="relative" style={{ borderRadius: radius, overflow: "hidden" }}>
          {thumbnail}

          {hover.hovered && (
            <Stack
              justify="center"
              align="center"
              pos="absolute"
              className="clickable"
              w="100%"
              h="100%"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                top: 0,
                left: 0,
                borderTopRightRadius: radius,
                borderTopLeftRadius: radius,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return props.onGallery();
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
          pos="absolute"
          className="clickable"
          style={{
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
