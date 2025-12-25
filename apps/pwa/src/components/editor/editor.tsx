"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TipTapTaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";

import { FileType } from "@/graphql/enums.graphql";
import { UploadFileOptions } from "@/modules/files/file-types";
import { renderFileUrl } from "@/modules/files/files-utils";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { ModalFiles } from "@/modules/files/modals/modal-files";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { alpha, Box, Group, Loader, Text, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  getTaskListExtension,
  RichTextEditor,
  RichTextEditorProps,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import TaskItem from "@tiptap/extension-task-item";
import { Extensions, JSONContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ClipboardEventHandler, FC, useMemo } from "react";
import { ImageResize } from "./editor-image-resize";

import { classNames } from "@/utils/ui.utils";
import styles from "./editor.module.css";

import { UsersMention } from "./editor-mention";

interface EditorProps extends Partial<Omit<RichTextEditorProps, "defaultValue">> {
  value?: string | JSONContent | undefined | null;
  defaultValue?: string | JSONContent | undefined | null;
  onChangeHTML?: (content?: string) => void;
  onChangeJSON?: (content?: JSONContent) => void;
  delay?: number;
  placeholder?: string;
  uploadFileOptions?: UploadFileOptions;
  isShowToolbar?: boolean;
  isNonWrapped?: boolean;
}

function InsertImageControl() {
  const { editor } = useRichTextEditorContext();
  return (
    <ModalFiles>
      {(openFiles) => (
        <RichTextEditor.Control
          onClick={() => {
            openFiles({
              fileTypes: [FileType.Photo],
              onSelectedFiles: (files) => {
                files.forEach((file) => {
                  editor?.commands.insertContent({
                    type: "image",
                    attrs: {
                      src: renderFileUrl(file.path),
                      style: "width: 500px; height: auto;",
                    },
                  });
                });
              },
            });
          }}
          aria-label="Insert star emoji"
          title="Insert star emoji"
        >
          <IconPhoto stroke={1.5} size="1rem" />
        </RichTextEditor.Control>
      )}
    </ModalFiles>
  );
}

export const Editor: FC<EditorProps> = ({
  value,
  onChangeHTML,
  onChangeJSON,
  delay,
  placeholder,
  uploadFileOptions,
  isShowToolbar = true,
  isNonWrapped = false,
  defaultValue,
  ...rest
}) => {
  const color = useColor();
  const uploadFile = useUploadFile();

  const onChange = useDebouncedCallback((html: string, json: JSONContent) => {
    onChangeHTML?.(html);
    onChangeJSON?.(json);
  }, delay ?? 0);

  const editorExtensions: Extensions = useMemo(() => {
    const ext = [
      StarterKit.configure({ link: false }),
      Link,
      Superscript,
      Subscript,
      Highlight,
      ImageResize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      getTaskListExtension(TipTapTaskList),
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
      }),
      UsersMention,
    ];

    return ext;
  }, [placeholder]);

  const editor = useEditor({
    extensions: editorExtensions,
    content: defaultValue ?? value,
    onUpdate: (e) => {
      onChange(e.editor.getHTML(), e.editor.getJSON());
    },
    immediatelyRender: false,
  });

  const onDropImage = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const _file = await uploadFile(file, uploadFileOptions);
      editor?.commands.setImage({ src: renderFileUrl(_file.path) });
    }
  };

  const onPaste: ClipboardEventHandler<HTMLDivElement> = (e) => {
    if (!e.clipboardData) return;

    let files: File[] = [];

    Array.from(e.clipboardData.files).forEach(async (file) => {
      files.push(file);
    });

    onDropImage(files);
  };

  if (!editor) return <Loader size="xs" />;

  return (
    <Dropzone onDrop={onDropImage} accept={IMAGE_MIME_TYPE} activateOnClick={false}>
      <Box
        className={classNames(styles.Editor, {
          [styles.isNonWrapped]: isNonWrapped,
        })}
      >
        <RichTextEditor {...rest} editor={editor} onPaste={onPaste}>
          {isShowToolbar && (
            <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <InsertImageControl />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
                <RichTextEditor.ClearFormatting />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Undo />
                <RichTextEditor.Redo />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
          )}

          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <InsertImageControl />
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </BubbleMenu>

          <RichTextEditor.Content
            onClick={(e) => {
              // If target has class "is-empty" then focus on the editor
              if (!(e.target as HTMLElement).classList.contains("is-empty")) {
                editor?.commands.focus();
              }
            }}
          />
        </RichTextEditor>

        <Dropzone.Accept>
          <Group
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 100,
              background: alpha(color("primary"), 0.8),
              borderRadius: 10,
            }}
            justify="center"
            align="center"
          >
            <ThemeIcon color="white" variant="transparent">
              <IconUpload />
            </ThemeIcon>

            <Text c="white">
              <Trans>Drop image here</Trans>
            </Text>
          </Group>
        </Dropzone.Accept>
      </Box>
    </Dropzone>
  );
};
