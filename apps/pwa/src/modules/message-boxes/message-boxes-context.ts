import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { createContext, useContext } from "react";

interface ContextType {
  messageBoxes: MessageBoxEntity[];
  messageBoxIds: string[];
  messageBox: MessageBoxEntity | null;
  messageBoxId: string | null;
  open: (box: MessageBoxEntity) => void;
  close: (box: MessageBoxEntity) => void;
  isInitialized: boolean;
}

export const MessageBoxesContext = createContext({} as ContextType);
export const useMessageBoxes = () => useContext(MessageBoxesContext);