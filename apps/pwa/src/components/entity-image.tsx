import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { renderLink } from "@/modules/files/files-utils";
import { FileType } from "@/modules/files/file-types";
import { t } from "@/modules/lang/lang-service";
import { ActionIcon, Box, Card, Center, em, Image, Stack, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import { Icon, IconEye, IconPhoto, IconProps, IconUpload } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { Button } from "./buttons/button";
import { Renderer } from "./renderer";
import { OnFileModal } from "@/modules/files/modals/modal-files";

interface EntityImageProps {
  src?: string | File;
  onChange?: (image: File) => void;
  onlyRead?: boolean;
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
  const disabled = props.onlyRead || !props.onChange;
  const w = props.w || props.size || 100;
  const h = props.h || props.size || 100;
  const src = props.src instanceof File ? URL.createObjectURL(props.src) : renderLink(props.src);
  const Icon = props.icon || IconPhoto;
  const size = typeof h === "number" ? h * 0.5 : h;
  const openRef = useRef<() => void>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const onView = () => {
    if (!src) return;
    if (props.onView) return props.onView();
    OnModalFileGallery({
      files: [{ url: src, fileName: props.name || "image", type: FileType.PHOTO }],
      disabled: true,
    });
  };

  const ableView = !!props.src && !loadFailed;
  const hovered = hover.hovered;

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
        ref={hover.ref}
        p={0}
        bg="gray.1"
        maw="100%"
        mah="100%"
        h={h}
        w={w}
        radius={props.radius || 10}
        style={{ cursor: "pointer", position: "relative" }}
        onClick={() => {
          if (disabled)
            return OnModalFileGallery({
              files: [{ url: src, fileName: props.name || "image", type: FileType.PHOTO }],
            });
          openRef.current?.();
        }}
        withBorder
        shadow="none"
      >
        <Renderer visible={ableView}>
          <Image
            src={src}
            h={h}
            w={w}
            fit={props.fit || "cover"}
            flex={1}
            onError={() => setLoadFailed(true)}
          />
        </Renderer>

        <Renderer visible={(!ableView && !hovered) || disabled}>
          <Center h="100%">
            <ThemeIcon size={size} color="gray.5" variant="transparent">
              <Icon strokeWidth={1.2} {...props.iconProps} />
            </ThemeIcon>
          </Center>
        </Renderer>

        <Renderer visible={hovered}>
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
            <Renderer visible={!!props.src}>
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
                leftIcon={IconUpload}
                size="xs"
                iconSize={16}
                variant="transparent"
                color="white"
                fw={400}
                fz={em(14)}
                iconSpacing={-8}
              >
                {t("upload")}
              </Button>
            </Renderer>
          </Stack>
        </Renderer>
      </Card>
    </Dropzone>
  );
};
