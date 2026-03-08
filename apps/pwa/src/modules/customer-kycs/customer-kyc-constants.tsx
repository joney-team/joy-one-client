import { CustomerKycStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const customerKycStatuses: Record<
  CustomerKycStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [CustomerKycStatus.Pending]: { label: defineMessage`Pending`, color: "gray" },
  [CustomerKycStatus.Approved]: { label: defineMessage`Approved`, color: "green" },
  [CustomerKycStatus.Rejected]: { label: defineMessage`Rejected`, color: "red" },
};
