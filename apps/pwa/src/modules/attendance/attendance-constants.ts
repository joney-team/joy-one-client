import { AttendanceRecordType } from "@/graphql/enums.graphql";
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
