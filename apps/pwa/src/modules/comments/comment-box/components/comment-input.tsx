import { uploadFile } from "@/modules/files/file-service";
import { tl } from "@/modules/lang/lang-service";
import { detectMessageAttachmentType } from "@/modules/message-boxes/message-boxes-service";
import {
  ActionIcon,
  Button,
  Card,
  em,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  MS_EXCEL_MIME_TYPE,
  MS_POWERPOINT_MIME_TYPE,
  MS_WORD_MIME_TYPE,
  PDF_MIME_TYPE,
} from "@mantine/dropzone";
import { IconPaperclip, IconPhoto, IconSend2 } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { FileCard } from "@/modules/files/file-card";
import { UseCommentBox } from "../types";
import { onError } from "@/utils/exceptions.utils";

export const CommentInput: FC<UseCommentBox> = (ctx) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmiting, setIsSubmiting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const onSubmit = async () => {
    const _text = textInputRef.current?.value.trim();
    if (!_text && files.length === 0) return;

    try {
      setIsSubmiting(true);

      const _files = await Promise.all(
        files.map((f) =>
          f instanceof File
            ? uploadFile({
                file: f,
                ref: ctx.ref,
              }).then((r) => r.url)
            : f
        )
      );

      const attachments = _files.map((f) => ({
        type: detectMessageAttachmentType(f),
        url: f,
      }));

      await ctx.send({
        text: _text,
        attachments,
      });

      setFiles([]);
      textInputRef.current!.value = "";
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmiting(false);
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
        <Stack p={16} w="100%" style={{ pointerEvents: "all" }}>
          <Card
            bg="var(--mantine-color-body)"
            shadow="xs"
            w="100%"
            p={8}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Stack gap={5}>
              <Textarea
                px={8}
                w="100%"
                ref={textInputRef}
                id="comment-box-text-input"
                autosize
                maxRows={2}
                minRows={1}
                placeholder={tl("type_and_press_enter")}
                variant="unstyled"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
              />

              <ScrollArea.Autosize mah={130}>
                {files.length > 0 && (
                  <Group gap={10}>
                    {files.map((file, key) => (
                      <FileCard
                        key={key}
                        src={file}
                        onRemove={() => setFiles((f) => f.filter((f) => f !== file))}
                      />
                    ))}
                  </Group>
                )}
              </ScrollArea.Autosize>

              <Group justify="space-between">
                <Group gap={0}>
                  <Dropzone
                    accept={[...IMAGE_MIME_TYPE]}
                    onDrop={(files) => setFiles((f) => [...f, ...files])}
                    style={{ padding: 0, border: "none", background: "transparent" }}
                  >
                    <ActionIcon
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
                  rightSection={<IconSend2 size={em(20)} style={{ marginRight: -5 }} />}
                  fz={13}
                  loading={isSubmiting}
                  onClick={onSubmit}
                >
                  {tl("send")}
                </Button>
              </Group>
            </Stack>
          </Card>

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
                    {tl("preview")}
                  </Title>

                  <Text ta="center" fz={14} c="gray.6">
                    {tl("drop_file_preview")}
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
