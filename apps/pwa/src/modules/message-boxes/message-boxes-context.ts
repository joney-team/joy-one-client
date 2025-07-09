import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { createContext, useContext } from "react";

interface ContextType {
  messageBox: MessageBoxEntity | null;
  messageBoxId: string | null;
  open: (box: MessageBoxEntity) => void;
  close: () => void;
}

export const MessageBoxesContext = createContext({} as ContextType);
export const useMessageBoxes = () => useContext(MessageBoxesContext);