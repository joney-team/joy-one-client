"use client";

import { FileType } from "@/graphql/enums.graphql";
import { renderFileUrl } from "@/modules/files/files-utils";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import type { ModalFilesRef } from "@/modules/files/modals/modal-files";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Box,
  Card,
  Center,
  Image,
  InputWrapper,
  InputWrapperProps,
  Stack,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { IconEye, IconPencil, IconPhoto, IconUpload } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, useState, type FC } from "react";
import { Button } from "../buttons/button";
import { Renderer } from "../renderer";

const ModalFilesViewer = dynamic(
  () => import("@/modules/files/modals/modal-files-viewer").then((mod) => mod.ModalFilesViewer),
  { ssr: false, loading: nonLoading },
);

const ModalFiles = dynamic(
  () => import("@/modules/files/modals/modal-files").then((mod) => mod.ModalFiles),
  { ssr: false, loading: nonLoading },
);

interface ImageInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  h?: number | string;
  w?: number | string;
  radius?: number;
  permission?: WorkspacePermission;
}

export const ImageInput: FC<ImageInputProps> = (props) => {
  const workspace = useWorkspace();
  const uploadFile = useUploadFile();
  const modalFilesRef = useRef<ModalFilesRef>(null);

  const { value, onChange, disabled: propsDisabled, h, w, ...rest } = props;
  const [loadFailed, setLoadFailed] = useState(false);
  const openRef = useRef<() => void>(null);
  const hover = useHover();
  const ableView = !!value && !loadFailed;
  const disabled =
    propsDisabled || (props.permission && !workspace.hasPermission(props.permission));

  const onView = () => {
    if (!value) return;
    modalFilesRef.current?.filesViewer.open({
      files: [{ url: value, fileName: "image", type: FileType.Photo }],
      disabled: true,
    });
  };

  return (
    <InputWrapper {...rest}>
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        onDrop={async (files) => {
          if (files.length === 0) return;
          const file = files[0];
          const res = await uploadFile(file);
          onChange?.(res.path);
        }}
        disabled={disabled}
        multiple={false}
        activateOnClick={false}
        openRef={openRef}
      >
        <Card
          pos="relative"
          ref={hover.ref}
          p={0}
          bg="gray.1"
          maw="100%"
          mah="100%"
          h={h}
          w={w}
          radius={props.radius ?? 10}
          className="clickable"
          onClick={() => {
            if (disabled) {
              onView();
            } else {
              modalFilesRef.current?.open({
                fileTypes: [FileType.Photo],
                length: 1,
                onSelectedFiles: (files) => {
                  if (files.length === 0) return;
                  const file = files[0];
                  onChange?.(file.path);
                  setLoadFailed(false);
                },
              });
            }
          }}
          withBorder
          shadow="none"
          style={{
            borderColor: "var(--mantine-color-default-border)",
            overflow: "hidden",
          }}
        >
          <Image
            src={renderFileUrl(value)}
            h="100%"
            w="100%"
            fit="cover"
            flex={1}
            onError={() => setLoadFailed(true)}
            onLoad={() => setLoadFailed(false)}
            style={{
              display: ableView ? "block" : "none",
            }}
          />

          {!ableView && !hover.hovered && (
            <Center h="100%" w="100%">
              <IconPhoto size={20} color="gray" strokeWidth={1.5} />
            </Center>
          )}

          {hover.hovered && (
            <Stack
              gap={10}
              align="center"
              justify="center"
              bg="#00000098"
              h="100%"
              w="100%"
              style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
              onClick={(e) => {
                if (disabled) {
                  e.stopPropagation();
                  onView();
                }
              }}
            >
              <Renderer visible={!!value}>
                <Box
                  style={
                    disabled
                      ? {
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }
                      : {
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }
                  }
                  p={5}
                >
                  <ActionIcon
                    variant="subtle"
                    color="white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <IconEye strokeWidth={1.3} />
                  </ActionIcon>
                </Box>
              </Renderer>

              <Renderer visible={!disabled}>
                <Button
                  leftIcon={value ? IconPencil : IconUpload}
                  size="xs"
                  variant="transparent"
                  color="white"
                  label={value ? <Trans>Change</Trans> : <Trans>Upload</Trans>}
                />
              </Renderer>
            </Stack>
          )}
        </Card>
      </Dropzone>

      <ModalFiles ref={modalFilesRef} />
    </InputWrapper>
  );
};
