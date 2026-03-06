import { BookingStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import {
  Icon,
  IconAnalyze,
  IconArrowsLeftRight,
  IconCheck,
  IconClock,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";

export const bookingStatuses: Record<
  BookingStatus,
  { label: MacroMessageDescriptor; color: string; icon: Icon }
> = {
  [BookingStatus.JustCreated]: {
    label: defineMessage`Just created`,
    color: "primary",
    icon: IconClock,
  },
  [BookingStatus.CheckIn]: {
    label: defineMessage`Check in`,
    color: "primary",
    icon: IconUserCheck,
  },
  [BookingStatus.InProgress]: {
    label: defineMessage`In progress`,
    color: "orange",
    icon: IconAnalyze,
  },
  [BookingStatus.Rescheduled]: {
    label: defineMessage`Rescheduled`,
    color: "violet",
    icon: IconArrowsLeftRight,
  },
  [BookingStatus.Completed]: { label: defineMessage`Completed`, color: "green", icon: IconCheck },
  [BookingStatus.Cancelled]: { label: defineMessage`Cancelled`, color: "red", icon: IconX },
};

export const bookingActiveStatus: BookingStatus[] = [
  BookingStatus.JustCreated,
  BookingStatus.CheckIn,
  BookingStatus.InProgress,
];
