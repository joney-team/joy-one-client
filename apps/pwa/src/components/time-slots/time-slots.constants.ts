import { createContext, useContext } from "react";
import { TimeSlotsContextValue } from "./time-slots.types";

export const TIME_SLOTS_CONFIG = {
  hourColumnWidth: 60,
  hourCellHeight: 80,
  cursorTimeAttr: "cursor-time",
  cursorColumnIndexAttr: "cursor-column-index",
  selectTimeFromAttr: "select-time-from",
  selectColumnIndexAttr: "select-column-index",
};

export const HOURS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
];

export const TimeSlotsContext = createContext({} as TimeSlotsContextValue);

export const useTimeSlots = () => useContext(TimeSlotsContext);
