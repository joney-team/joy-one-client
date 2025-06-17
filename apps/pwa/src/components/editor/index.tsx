"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

import { onUploadFile } from "@/modules/files/file-service";
import { FileType, UploadFileOptions } from "@/modules/files/file-types";
import { renderLink } from "@/modules/files/files-utils";
import { OnFileModal } from "@/modules/files/modals/modal-files";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { alpha, Box, Group, Loader, Text, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDebouncedCallback } from "@mantine/hooks";
import { RichTextEditor, RichTextEditorProps, useRichTextEditorContext } from "@mantine/tiptap";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { Extensions, JSONContent, useEditor } from "@tiptap/react";
import { ClipboardEventHandler, FC, useState } from "react";
import { ImageResize } from "./image-resize";

interface EditorProps {
  value?: string | JSONContent | undefined | null;
  onChangeHTML?: (content?: string) => void;
  onChangeJSON?: (content?: JSONContent) => void;
  delay?: number;
  placeholder?: string;
  uploadFileOptions?: UploadFileOptions;
  isAlwayShowToolbar?: boolean;
  props?: Partial<RichTextEditorProps>;
}

const extensions: Extensions = [
  StarterKit,
  Underline,
  Link,
  Superscript,
  Subscript,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  ImageResize,
];

function InsertImageControl() {
  const { editor } = useRichTextEditorContext();
  return (
    <RichTextEditor.Control
      onClick={() => {
        OnFileModal({
          fileTypes: [FileType.PHOTO],
          onSelectedFiles: (files) => {
            files.forEach((file) => {
              editor?.commands.insertContent({
                type: "image",
                attrs: {
                  src: renderLink(file.relativePath),
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
  );
}

export const Editor: FC<EditorProps> = (props) => {
  const color = useColor();
  const [focused, setFocused] = useState(false);

  const onChange = useDebouncedCallback((val: string) => {
    props.onChangeHTML?.(val);
  }, props.delay || 0);

  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    content: props.value,
    onUpdate: (e) => {
      onChange(e.editor.getHTML());
      props.onChangeJSON?.(e.editor.getJSON());
    },
    immediatelyRender: false,
  });

  const onDropImage = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const _file = await onUploadFile({ file, ...props.uploadFileOptions });
      editor?.commands.setImage({ src: renderLink(_file.relativePath) });
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
      <Box style={{ position: "relative", width: "100%" }}>
        <RichTextEditor
          editor={editor}
          flex={1}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props.props}
        >
          {(focused || props.isAlwayShowToolbar) && (
            <RichTextEditor.Toolbar>
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

            <Text c="white">{t("drop_img_here")}</Text>
          </Group>
        </Dropzone.Accept>
      </Box>
    </Dropzone>
  );
};
