import { PromotionStatus, PromotionType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const promotionTypes: Record<
  PromotionType,
  { label: MacroMessageDescriptor; color: MantineColor; min?: number; max?: number }
> = {
  [PromotionType.DiscountRate]: {
    label: defineMessage`Discount rate`,
    color: "indigo",
    min: 0,
    max: 100,
  },
  [PromotionType.DiscountAmount]: { label: defineMessage`Discount amount`, color: "green", min: 0 },
};

export const promotionStatuses: Record<
  PromotionStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [PromotionStatus.Active]: { label: defineMessage`Active`, color: "green" },
  [PromotionStatus.Closed]: { label: defineMessage`Closed`, color: "red" },
  [PromotionStatus.Expired]: { label: defineMessage`Expired`, color: "gray" },
};
