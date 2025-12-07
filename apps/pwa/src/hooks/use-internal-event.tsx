import EventEmitter from "events";

export const InternalEvent = {
  REFETCH_TASKS: "REFETCH_TASKS",
  GANTT_TASKS_OPEN_ALL_FOLDER: "GANTT_TASKS_OPEN_ALL_FOLDER",
  GANTT_TASKS_CLOSE_ALL_FOLDER: "GANTT_TASKS_CLOSE_ALL_FOLDER",
  TASK_MENU_OPEN: "TASK_MENU_OPEN",
  TASK_MENU_SET_ROOT: "TASK_MENU_SET_ROOT",
} as const;

export type InternalEvent = (typeof InternalEvent)[keyof typeof InternalEvent];

const eventsEmitter = new EventEmitter();

export const addInternalEventsListener = (
  type: InternalEvent,
  listener: (...args: unknown[]) => void
) => {
  eventsEmitter.addListener(type, listener);
};

export const removeInternalEventsListner = (
  type: InternalEvent,
  listener: (...args: unknown[]) => void
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

export const emitInternalEvent = (type: InternalEvent, ...args: unknown[]) => {
  eventsEmitter.emit(type, ...args);
};
