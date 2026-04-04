import { ProductComboStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const productComboStatuses: Record<
  ProductComboStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [ProductComboStatus.Active]: { label: defineMessage`Active`, color: "green" },
  [ProductComboStatus.Inactive]: { label: defineMessage`Inactive`, color: "gray" },
  [ProductComboStatus.Expired]: { label: defineMessage`Expired`, color: "red" },
  [ProductComboStatus.OutOfStock]: { label: defineMessage`Out of stock`, color: "gray" },
  [ProductComboStatus.SourceUnavailable]: {
    label: defineMessage`Source unavailable`,
    color: "red",
  },
};
