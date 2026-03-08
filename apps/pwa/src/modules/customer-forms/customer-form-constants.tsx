import { CustomerFormStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const customerFormStatuses: Record<
  CustomerFormStatus,
  {
    label: MacroMessageDescriptor;
    color: MantineColor;
  }
> = {
  [CustomerFormStatus.Pending]: {
    label: defineMessage`Pending`,
    color: "gray",
  },
  [CustomerFormStatus.Completed]: {
    label: defineMessage`Completed`,
    color: "green",
  },
  [CustomerFormStatus.Cancelled]: {
    label: defineMessage`Cancelled`,
    color: "red",
  },
};
