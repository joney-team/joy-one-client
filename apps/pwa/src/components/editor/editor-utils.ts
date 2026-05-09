import { computePosition, flip, shift } from "@floating-ui/react-dom";
import { zIndexes } from "@joy-one/config/layout";
import { Editor, posToDOMRect } from "@tiptap/react";

export const parseEditorJSON = (rawValue?: string | null): object | null => {
  try {
    if (!rawValue || typeof rawValue !== "string" || rawValue.length === 0) return null;
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
};

export const updatePosition = (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = "max-content";
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.zIndex = `${zIndexes.commonModals + 100}`;
  });
};

export const isEmptyContent = (editor: Editor) => {
  const jsonContent = editor.getJSON().content;
  return jsonContent.every((c) => !c.content || c.content.length === 0);
};
