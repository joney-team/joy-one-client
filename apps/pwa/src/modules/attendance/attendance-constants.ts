import { AttendanceRecordStatus, AttendanceRecordType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconArrowBarRight, IconArrowBarToRight } from "@tabler/icons-react";

export const attendanceRecordTypes: Record<
  AttendanceRecordType,
  { label: MacroMessageDescriptor; icon: Icon; color?: MantineColor }
> = {
  [AttendanceRecordType.CheckIn]: {
    label: defineMessage`Check In`,
    icon: IconArrowBarToRight,
    color: "primary",
  },
  [AttendanceRecordType.CheckOut]: {
    label: defineMessage`Check Out`,
    icon: IconArrowBarRight,
    color: "gray",
  },
};

export const attendanceRecordStatuses: Record<
  AttendanceRecordStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [AttendanceRecordStatus.Approved]: {
    label: defineMessage`Approved`,
    color: "primary",
  },
  [AttendanceRecordStatus.Pending]: {
    label: defineMessage`Pending`,
    color: "gray",
  },
  [AttendanceRecordStatus.Rejected]: {
    label: defineMessage`Rejected`,
    color: "red",
  },
};
