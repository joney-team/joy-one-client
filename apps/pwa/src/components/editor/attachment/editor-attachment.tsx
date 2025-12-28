import { Node } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AttachmentNodeView } from "./editor-attachment-node-view";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    attachment: {
      addAttachment: (id: string) => ReturnType;
    };
  }
}

export const AttachmentExtension = Node.create({
  name: "attachment",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attrs) => ({
          "data-id": attrs.id,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-attachment]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-attachment": "",
        ...HTMLAttributes,
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentNodeView);
  },

  addCommands() {
    return {
      addAttachment:
        (id) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { id },
          }),
    };
  },
});
