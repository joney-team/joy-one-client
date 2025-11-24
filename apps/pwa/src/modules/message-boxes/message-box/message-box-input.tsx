"use client";

import { Button } from "@/components/buttons/button";
import { FileType } from "@/graphql/enums.graphql";
import { eventsEmitter } from "@/modules/events/event-service";
import { FileCard } from "@/modules/files/file-card";
import { parseFile } from "@/modules/files/files-utils";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import {
  sendFileMessage,
  sendImageMessage,
  sendTextMessage,
} from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { t } from "@lingui/core/macro";
import { ActionIcon, em, Group, ScrollArea, Stack, Text, Textarea, Title } from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  MS_EXCEL_MIME_TYPE,
  MS_POWERPOINT_MIME_TYPE,
  MS_WORD_MIME_TYPE,
  PDF_MIME_TYPE,
} from "@mantine/dropzone";
import { useForceUpdate } from "@mantine/hooks";
import { IconPaperclip, IconPhoto, IconSend } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";

export const InputMessageBox: FC<{ box: MessageBoxEntity }> = (props) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const forceUpdate = useForceUpdate();
  const uploadFile = useUploadFile();

  const isSubmitting = useRef(false);
  const [files, setFiles] = useState<(File | string)[]>([]);

  const onSubmit = async () => {
    const _text = textInputRef.current?.value.trim();
    if ((!_text && files.length === 0) || isSubmitting.current) return;

    try {
      isSubmitting.current = true;
      forceUpdate();

      // Upload files
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const type = parseFile(file).type;
        const url = file instanceof File ? await uploadFile(file).then((r) => r.url) : file;

        if (type === FileType.Photo) {
          await sendImageMessage(props.box._id, { url });
        } else {
          await sendFileMessage(props.box._id, { url });
        }
      }

      // Send text message
      if (_text) await sendTextMessage(props.box._id, { text: _text });

      eventsEmitter.emit("message-box", { type: "scrollToBottom", args: ["smooth", 200] });

      setFiles([]);
      textInputRef.current!.value = "";
    } catch (error) {
      console.error(error);
    } finally {
      isSubmitting.current = false;
      forceUpdate();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ position: "relative" }}
    >
      <Dropzone
        acceptColor="#ffffff00"
        onDrop={(files) => setFiles((f) => [...f, ...files])}
        activateOnClick={false}
        styles={{
          root: {
            border: "none",
            padding: 0,
            background: "transparent !important",
          },
          inner: {
            background: "transparent !important",
          },
        }}
      >
        <Stack w="100%" style={{ pointerEvents: "all" }}>
          <Stack gap={0}>
            <Textarea
              pt={8}
              px={12}
              w="100%"
              ref={textInputRef}
              autosize
              maxRows={5}
              minRows={1}
              placeholder={t`Type and press [enter]`}
              variant="unstyled"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />

            <ScrollArea.Autosize mah={130}>
              {files.length > 0 && (
                <Group gap={10} px={8}>
                  {files.map((file, key) => (
                    <FileCard
                      src={file}
                      key={key}
                      onRemove={() => setFiles((f) => f.filter((f) => f !== file))}
                    />
                  ))}
                </Group>
              )}
            </ScrollArea.Autosize>

            <Group justify="space-between" px={12} pb={12}>
              <Group gap={0}>
                <Dropzone
                  accept={[...IMAGE_MIME_TYPE]}
                  onDrop={(files) => setFiles((f) => [...f, ...files])}
                  style={{ padding: 0, border: "none", background: "transparent" }}
                >
                  <ActionIcon
                    component="div"
                    size="lg"
                    variant="subtle"
                    color="gray"
                    style={{ pointerEvents: "all" }}
                  >
                    <IconPhoto size={em(22)} strokeWidth={1.5} />
                  </ActionIcon>
                </Dropzone>

                <Dropzone
                  accept={[
                    ...PDF_MIME_TYPE,
                    ...MS_WORD_MIME_TYPE,
                    ...MS_EXCEL_MIME_TYPE,
                    ...MS_POWERPOINT_MIME_TYPE,
                  ]}
                  onDrop={(files) => setFiles((f) => [...f, ...files])}
                  style={{ padding: 0, border: "none", background: "transparent" }}
                >
                  <ActionIcon
                    component="div"
                    size="lg"
                    variant="subtle"
                    color="gray"
                    style={{ pointerEvents: "all" }}
                  >
                    <IconPaperclip size={em(22)} strokeWidth={1.5} />
                  </ActionIcon>
                </Dropzone>
              </Group>

              <Button
                px={16}
                radius={100}
                size="sm"
                rightIcon={IconSend}
                fz={13}
                loading={isSubmitting.current}
                onClick={onSubmit}
              >
                {t`Send`}
              </Button>
            </Group>
          </Stack>

          <Dropzone.Accept>
            <Stack
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
              }}
              w="100%"
              h="100%"
              p={8}
            >
              <Group
                h="100%"
                w="100%"
                justify="center"
                align="center"
                bg="#ffffff90"
                style={{
                  backdropFilter: "blur(1px)",
                }}
              >
                <Stack justify="center" align="center" w="100%" gap={3}>
                  <Title ta="center" order={4} fw={500}>
                    {t`Preview`}
                  </Title>

                  <Text ta="center" fz={14} c="gray.6">
                    {t`Drop file to preview`}
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Dropzone.Accept>
        </Stack>
      </Dropzone>
    </form>
  );
};
