import EventEmitter from "events";
import { useEffect } from "react";

export const InternalEvent = {
  REFETCH_TASKS: "REFETCH_TASKS",
  GANTT_TASKS_OPEN_ALL_FOLDER: "GANTT_TASKS_OPEN_ALL_FOLDER",
  GANTT_TASKS_CLOSE_ALL_FOLDER: "GANTT_TASKS_CLOSE_ALL_FOLDER",
  TASK_MENU_OPEN: "TASK_MENU_OPEN",
  TASK_MENU_CLOSE: "TASK_MENU_CLOSE",
  TASK_MENU_SET_ROOT: "TASK_MENU_SET_ROOT",
  WORKSPACE_CHANGED: "WORKSPACE_CHANGED",
} as const;

export type InternalEvent = (typeof InternalEvent)[keyof typeof InternalEvent];

const eventsEmitter = new EventEmitter();
eventsEmitter.setMaxListeners(500);

export const addInternalEventsListener = (
  type: InternalEvent,
  listener: (...args: unknown[]) => void,
) => {
  eventsEmitter.addListener(type, listener);
};

export const removeInternalEventsListner = (
  type: InternalEvent,
  listener: (...args: unknown[]) => void,
) => {
  eventsEmitter.removeListener(type, listener);
};

export const onInternalEvent = (type: InternalEvent, listener: (...args: unknown[]) => void) => {
  eventsEmitter.addListener(type, listener);

  // Return cleanup function
  return () => {
    eventsEmitter.removeListener(type, listener);
  };
};

export const useInternalEventsListener = (
  types: InternalEvent[],
  listener: (...args: unknown[]) => void,
) => {
  useEffect(() => {
    types.forEach((type) => eventsEmitter.addListener(type, listener));

    // Cleanup function to remove listeners when the component unmounts or types/ listener changes
    return () => {
      types.forEach((type) => eventsEmitter.removeListener(type, listener));
    };
  }, [types, listener]);
};

export const emitInternalEvent = (type: InternalEvent, ...args: unknown[]) => {
  eventsEmitter.emit(type, ...args);
};
