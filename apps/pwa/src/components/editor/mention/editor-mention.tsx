"use client";

import { type MentionOptions } from "@tiptap/extension-mention";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";

import Mention from "@tiptap/extension-mention";
import { updatePosition } from "../editor-utils";
import { MentionList, MentionListProps, MentionListRef } from "./editor-mention-list";
import { MentionRenderer } from "./editor-mention-renderer";

export const suggestion: MentionOptions["suggestion"] = {
  char: "@",
  render: () => {
    let reactRenderer: ReactRenderer<MentionListRef, MentionListProps> | null = null;

    return {
      onStart: (props) => {
        if (!props.clientRect) {
          return;
        }

        reactRenderer = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        reactRenderer.element.style.position = "absolute";
        document.body.appendChild(reactRenderer.element);

        updatePosition(props.editor, reactRenderer.element);
      },

      onUpdate(props) {
        if (!reactRenderer) return;

        reactRenderer?.updateProps(props);

        if (!props.clientRect) return;
        updatePosition(props.editor, reactRenderer.element);
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          reactRenderer?.destroy();
          reactRenderer?.element.remove();

          return true;
        }

        return reactRenderer?.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        reactRenderer?.destroy();
        reactRenderer?.element.remove();
      },
    };
  },
};

const UsersMentionExtension = Mention.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MentionRenderer);
  },
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute("data-id");
        },
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return {
            "data-id": attributes.id,
          };
        },
      },
      entity: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute("data-entity");
        },
        renderHTML: (attributes) => {
          if (!attributes.entity) return {};
          return {
            "data-entity": attributes.entity,
          };
        },
      },
    };
  },
});

export const UsersMention = UsersMentionExtension.configure({
  HTMLAttributes: {
    class: "mention",
  },
  suggestion,
});
