"use client";

import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EditorImageResizeNodeView } from "./editor-image-resize-node-view";

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "width: 100%; height: auto;",
        parseHTML: (element: HTMLElement) => {
          const width = element.getAttribute("width");
          return width ? `width: ${width}px; height: auto;` : `${element.style.cssText}`;
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(EditorImageResizeNodeView);
  },
});
