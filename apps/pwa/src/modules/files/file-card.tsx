"use client";

import { getFileTypeIcon } from "@/modules/files/file-service";
import { FileEntity, FileType } from "@/modules/files/file-types";
import { formatBytes } from "@/utils/file.utils";
import {
  Box,
  Card,
  Center,
  em,
  Group,
  Stack,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconCircleCheck, IconFile, IconVideo } from "@tabler/icons-react";
import { FC, Fragment, useRef } from "react";
import { Image } from "../../components/image";

export interface FileCardProps {
  file: FileEntity;
  isActive?: boolean;
  onClick?: (file: FileEntity) => void;
  disabled?: boolean;
  onDoubleClick?: (file: FileEntity) => void;
}

export const FileCard: FC<FileCardProps> = (props) => {
  const { file } = props;
  const theme = useMantineTheme();
  const Icon = getFileTypeIcon(file.type);
  const fileType = file.type;
  const isDoubleClick = useRef<boolean>(false);

  return (
    <Card
      p={5}
      key={file._id}
      withBorder
      radius={5}
      bg={props.disabled ? "gray.1" : "white"}
      onClick={() => {
        if (props.disabled) return;
        if (props.onDoubleClick) {
          setTimeout(() => {
            if (isDoubleClick.current) return;
            props.onClick?.(file);
          }, 200);
        } else {
          props.onClick?.(file);
        }
      }}
      onDoubleClick={() => {
        isDoubleClick.current = true;
        setTimeout(() => {
          isDoubleClick.current = false;
        }, 200);
        props.onDoubleClick?.(file);
      }}
      style={{
        userSelect: "none",
        maxWidth: "100%",
        borderColor: props.isActive ? theme.colors["primary"][6] : undefined,
        cursor: props.disabled ? "default" : "pointer",
        position: "relative",
        filter: props.disabled ? `grayscale(1)` : undefined,
      }}
    >
      <Stack gap={5}>
        {(function () {
          const url = file instanceof File ? URL.createObjectURL(file) : file.url;
          const extention = file.fileName.split(".").pop()?.toLowerCase();

          if (extention === "svg" || extention === "eps") {
            return (
              <object data={url} type="image/svg+xml" height={100}>
                <img src={url} />
              </object>
            );
          }

          if (fileType === FileType.PHOTO) {
            return <Image src={url} w="100%" fit="contain" bg="gray.1" h={100} />;
          }

          if (fileType === FileType.VIDEO)
            return (
              <Fragment>
                <video
                  src={url}
                  style={{
                    width: "100px",
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
            <Stack
              style={{
                height: 100,
                backgroundColor: "#f1f1f1",
              }}
            >
              <ThemeIcon color="gray" variant="transparent" size="lg">
                <IconFile strokeWidth={1.2} />
              </ThemeIcon>
            </Stack>
          );
        })()}

        <Group gap={5} justify="space-between" wrap="nowrap">
          <Group gap={5} wrap="nowrap" flex={1}>
            <ThemeIcon size="xs" variant="light" color="gray">
              <Icon size="0.8em" />
            </ThemeIcon>
            <Text maw={100} fz={em(10)} truncate="start">
              {file.fileName}
            </Text>
          </Group>
          <Text w="max-content" ta="right" fz={em(10)} c="gray">
            {formatBytes(file.size)}
          </Text>
        </Group>
      </Stack>

      {props.isActive && (
        <Box
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <Center
            style={{
              background: "white",
              width: 20,
              height: 20,
              borderRadius: "50%",
            }}
          >
            <IconCircleCheck color={theme.colors["primary"][6]} />
          </Center>
        </Box>
      )}
    </Card>
  );
};
