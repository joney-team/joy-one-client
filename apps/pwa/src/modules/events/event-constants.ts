import { EventVariant } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import {
  Icon,
  IconAlertTriangle,
  IconCheck,
  IconExclamationMark,
  IconHistoryToggle,
} from "@tabler/icons-react";

export const eventVariants: Record<
  EventVariant,
  { name: MacroMessageDescriptor; color: string; icon: Icon }
> = {
  [EventVariant.Info]: { name: defineMessage`Info`, color: "gray", icon: IconHistoryToggle },
  [EventVariant.Warning]: {
    name: defineMessage`Warning`,
    color: "orange",
    icon: IconAlertTriangle,
  },
  [EventVariant.Negative]: {
    name: defineMessage`Negative`,
    color: "red",
    icon: IconExclamationMark,
  },
  [EventVariant.Positive]: { name: defineMessage`Positive`, color: "green", icon: IconCheck },
};
