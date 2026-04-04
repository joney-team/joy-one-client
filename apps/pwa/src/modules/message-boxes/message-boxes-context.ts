import { createContext, useContext } from "react";
import { MessageBoxFragment } from "./graphql/fragmentMessageBox.graphql";

interface ContextType {
  messageBox: MessageBoxFragment | null;
  messageBoxId: string | null;
  open: (box: Pick<MessageBoxFragment, "_id">) => void;
  close: () => void;
}

export const MessageBoxesContext = createContext({} as ContextType);
export const useMessageBoxes = () => useContext(MessageBoxesContext);
