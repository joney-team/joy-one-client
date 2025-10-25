import { t } from "@lingui/core/macro";
import { PromotionStatus, PromotionType } from "./promotions-types";
import { MantineColor } from "@mantine/core";

export const promotionTypes: Record<
  PromotionType,
  { label: () => string; color: MantineColor; min?: number; max?: number }
> = {
  [PromotionType.DISCOUNT_RATE]: {
    label: () => t`Discount rate`,
    color: "indigo",
    min: 0,
    max: 100,
  },
  [PromotionType.DISCOUNT_AMOUNT]: { label: () => t`Discount amount`, color: "green", min: 0 },
};

export const promotionStatuses: Record<
  PromotionStatus,
  { label: () => string; color: MantineColor }
> = {
  [PromotionStatus.ACTIVE]: { label: () => t`Active`, color: "green" },
  [PromotionStatus.CLOSED]: { label: () => t`Closed`, color: "red" },
  [PromotionStatus.EXPIRED]: { label: () => t`Expired`, color: "gray" },
};
