import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { TaskMenuContextType } from "./task-menu-types";

export const useTaskMenu: () => TaskMenuContextType = () => ({
  open: (menu) => {
    emitInternalEvent(InternalEvent.TASK_MENU_OPEN, { menu });
  },
  setRoot: (root) => {
    emitInternalEvent(InternalEvent.TASK_MENU_SET_ROOT, { root });
  },
});
