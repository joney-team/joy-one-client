import { FileType } from "@/modules/files/file-types";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { OnModalFiles } from "@/modules/files/modals/modal-files";
import {
  ActionIcon,
  Box,
  Card,
  Image,
  InputWrapper,
  InputWrapperProps,
  Stack,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { useRef, useState, type FC } from "react";
import { Renderer } from "../renderer";
import { IconEye, IconPencil, IconUpload } from "@tabler/icons-react";
import { Button } from "../buttons/button";
import { t } from "@/modules/lang/lang-service";
import { renderLink } from "@/modules/files/files-utils";

interface ImageInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  h?: number | string;
  w?: number | string;
  radius?: number;
}

export const ImageInput: FC<ImageInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;
  const [loadFailed, setLoadFailed] = useState(false);
  const openRef = useRef<() => void>(null);
  const hover = useHover();
  const ableView = !!value && !loadFailed;

  const onView = () => {
    if (!value) return;
    OnModalFileGallery({
      files: [{ url: value, fileName: "image", type: FileType.PHOTO }],
      disabled: true,
    });
  };

  return (
    <InputWrapper {...rest}>
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        onDrop={(files) => {
          if (files.length === 0) return;
          const file = files[0];
          // const url = URL.createObjectURL(file);
          // onChange?.(url);
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
          h={props.h}
          w={props.w}
          radius={props.radius || 10}
          className="clickable"
          onClick={() => {
            if (disabled) {
              OnModalFileGallery({
                files: [{ url: value || "", fileName: "image", type: FileType.PHOTO }],
              });
              return;
            } else {
              OnModalFiles({
                fileTypes: [FileType.PHOTO],
                length: 1,
                onSelectedFiles: (files) => {
                  if (files.length === 0) return;
                  const file = files[0];
                  onChange?.(file.relativePath);
                },
              });
            }
          }}
          withBorder
          shadow="none"
        >
          {ableView && (
            <Image
              src={renderLink(value)}
              h="100%"
              w="100%"
              fit="cover"
              flex={1}
              onError={() => setLoadFailed(true)}
            />
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
                  iconSize={16}
                  variant="transparent"
                  color="white"
                  fw={400}
                  fz={14}
                  iconSpacing={-8}
                >
                  {t(value ? "change" : "upload")}
                </Button>
              </Renderer>
            </Stack>
          )}
        </Card>
      </Dropzone>
    </InputWrapper>
  );
};
