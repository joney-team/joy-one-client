import { OrderDiscountType, OrderPaymentStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const orderPaymentStatuses: Record<
  OrderPaymentStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [OrderPaymentStatus.Processing]: { label: defineMessage`Processing`, color: "gray" },
  [OrderPaymentStatus.Completed]: { label: defineMessage`Completed`, color: "green" },
};

export const orderDiscountTypes: Record<
  OrderDiscountType,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [OrderDiscountType.Direct]: { label: defineMessage`Direct`, color: "gray" },
  [OrderDiscountType.Combo]: { label: defineMessage`Use combo`, color: "gray" },
  [OrderDiscountType.Promotion]: { label: defineMessage`Use promotion`, color: "gray" },
};
