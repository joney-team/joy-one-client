"use client";

import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TipTapTaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";

import { UploadFileOptions } from "@/modules/files/file-types";
import { renderFileUrl } from "@/modules/files/files-utils";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { Box, BoxProps, Loader } from "@mantine/core";
import { useDebouncedCallback, useFileDialog } from "@mantine/hooks";
import {
  getTaskListExtension,
  RichTextEditor,
  RichTextEditorProps,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import { IconPhoto } from "@tabler/icons-react";
import TaskItem from "@tiptap/extension-task-item";
import { Editor as EditorType, Extensions, JSONContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ClipboardEventHandler, forwardRef, Fragment, useImperativeHandle, useMemo } from "react";
import { ImageResize } from "./image/editor-image-resize";

import { classNames } from "@/utils/ui.utils";
import styles from "./editor.module.css";

import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { Trans } from "@lingui/react/macro";
import { AttachmentExtension } from "./attachment/editor-attachment";
import { MentionExtension } from "./mention/editor-mention";

interface EditorProps extends Partial<Omit<RichTextEditorProps, "defaultValue">> {
  defaultValue?: string | JSONContent | undefined | null;
  onChangeHTML?: (content?: string) => void;
  onChangeJSON?: (content?: JSONContent) => void;
  onChangeText?: (content?: string) => void;
  delay?: number;
  placeholder?: string;
  uploadFileOptions?: UploadFileOptions;
  isEnableToolbar?: boolean;
  isEnableBubbleMenu?: boolean;
  isNonWrapped?: boolean;
  readonly?: boolean;
  container?: BoxProps;
}

function InsertImageControl() {
  const { editor } = useRichTextEditorContext();
  const uploadFile = useUploadFile();

  const fileDialog = useFileDialog({
    accept: "image/*",
    multiple: true,
    onChange(files) {
      if (!files || files.length === 0) return;
      fileDialog.reset();

      onActionLoad({
        name: <Trans>Uploading files</Trans>,
        process: async () => {
          await Promise.all(
            Array.from(files).map(async (file) => {
              try {
                const fileInfo = await uploadFile(file);
                editor?.commands.insertContent({
                  type: "image",
                  attrs: {
                    src: renderFileUrl(fileInfo.path),
                    style: "width: 500px; height: auto;",
                  },
                });
                return fileInfo;
              } catch (error) {
                onError(error);
              }
            }),
          );
        },
      });
    },
  });

  return (
    <Fragment>
      <RichTextEditor.Control onClick={fileDialog.open}>
        <IconPhoto stroke={1.5} size="1rem" />
      </RichTextEditor.Control>
    </Fragment>
  );
}

export interface EditorRef {
  getHTML: () => string;
  getJSON: () => JSONContent;
  getText: () => string;
  editor: EditorType | null;
  clear: () => void;
  focus: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  (
    {
      onChangeHTML,
      onChangeJSON,
      onChangeText,
      delay,
      placeholder,
      uploadFileOptions,
      isEnableToolbar = true,
      isEnableBubbleMenu = true,
      isNonWrapped = false,
      defaultValue,
      readonly = false,
      container,
      autoFocus = false,
      ...rest
    },
    ref,
  ) => {
    const uploadFile = useUploadFile();

    const onChange = useDebouncedCallback((html: string, json: JSONContent, text: string) => {
      if (readonly) return;
      onChangeHTML?.(html);
      onChangeJSON?.(json);
      onChangeText?.(text);
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
        MentionExtension,
        AttachmentExtension,
      ];

      return ext;
    }, [placeholder]);

    const editor = useEditor(
      {
        immediatelyRender: false,
        extensions: editorExtensions,
        content: defaultValue,
        onUpdate: readonly
          ? undefined
          : (e) => {
              onChange(e.editor.getHTML(), e.editor.getJSON(), e.editor.getText());
            },
        autofocus: autoFocus,
        editable: !readonly,
      },
      [readonly, editorExtensions],
    );

    const onDropImage = async (files: File[]) => {
      if (readonly) return;

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
        if (!file.type.startsWith("image/")) return;
        files.push(file);
      });

      onDropImage(files);
    };

    useImperativeHandle(ref, () => ({
      editor,
      getHTML: () => editor?.getHTML() ?? "",
      getJSON: () => editor?.getJSON() ?? {},
      getText: () => editor?.getText() ?? "",
      clear: () => editor?.commands.setContent({ type: "doc", content: [] }),
      focus: () => {
        if (editor) {
          // Focus at the end of document
          const docSize = editor.state.doc.content.size;
          editor.commands.focus(docSize);
        }
      },
    }));

    if (!editor) return <Loader size="xs" />;

    return (
      <Box
        className={classNames(styles.Editor, {
          [styles.isNonWrapped]: isNonWrapped,
          [styles.isReadonly]: readonly,
        })}
        {...container}
      >
        <RichTextEditor {...rest} editor={editor} onPaste={onPaste}>
          {isEnableToolbar && !readonly && (
            <RichTextEditor.Toolbar
              sticky
              stickyOffset="var(--docs-header-height)"
              styles={{ toolbar: { zIndex: 10 } }}
            >
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

          {!readonly && isEnableBubbleMenu && (
            <BubbleMenu editor={editor}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <InsertImageControl />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />

                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
              </RichTextEditor.ControlsGroup>
            </BubbleMenu>
          )}

          <RichTextEditor.Content
            onClick={(e) => {
              if (readonly) return;

              if (!(e.target as HTMLElement).classList.contains("is-empty")) {
                editor?.commands.focus();
              }
            }}
          />
        </RichTextEditor>
      </Box>
    );
  },
);
