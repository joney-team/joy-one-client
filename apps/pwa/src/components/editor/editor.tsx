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
import { type ModalFilesRef } from "@/modules/files/modals/modal-files";
import { Box, BoxProps, Loader } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
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
import {
  ClipboardEventHandler,
  forwardRef,
  Fragment,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { ImageResize } from "./image/editor-image-resize";

import { classNames } from "@/utils/ui.utils";
import styles from "./editor.module.css";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import { AttachmentExtension } from "./attachment/editor-attachment";
import { MentionExtension } from "./mention/editor-mention";

const ModalFiles = dynamic(
  () => import("@/modules/files/modals/modal-files").then((mod) => mod.ModalFiles),
  {
    ssr: false,
    loading: nonLoading,
  }
);

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
  const modalFiles = useRef<ModalFilesRef>(null);

  return (
    <Fragment>
      <RichTextEditor.Control
        onClick={() => {
          modalFiles.current?.open({
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

      <ModalFiles ref={modalFiles} />
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
    ref
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
        extensions: editorExtensions,
        content: defaultValue,
        onUpdate: readonly
          ? undefined
          : (e) => {
              onChange(e.editor.getHTML(), e.editor.getJSON(), e.editor.getText());
            },
        immediatelyRender: false,
        autofocus: autoFocus,
        editable: !readonly,
      },
      [readonly, editorExtensions]
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
  }
);
