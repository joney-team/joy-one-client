import { Icon, IconAlertTriangle, IconCheck, IconExclamationMark, IconHistoryToggle } from "@tabler/icons-react";
import { EventVariant } from "./event-types";

export const eventVariantColors: { [key in EventVariant]: string } = {
  [EventVariant.INFO]: 'gray',
  [EventVariant.WARNING]: 'orange',
  [EventVariant.NEGATIVE]: 'red',
  [EventVariant.POSITIVE]: 'green',
}

export const eventVariantIcons: { [key in EventVariant]: Icon } = {
  [EventVariant.INFO]: IconHistoryToggle,
  [EventVariant.WARNING]: IconAlertTriangle,
  [EventVariant.NEGATIVE]: IconExclamationMark,
  [EventVariant.POSITIVE]: IconCheck,
}