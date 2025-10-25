import { OrderDiscountType, OrderPaymentStatus } from "./orders-types";
import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const orderPaymentStatuses: Record<
  OrderPaymentStatus,
  { label: () => string; color: MantineColor }
> = {
  [OrderPaymentStatus.PROCESSING]: { label: () => t`Processing`, color: "gray" },
  [OrderPaymentStatus.COMPLETED]: { label: () => t`Completed`, color: "green" },
};

export const orderDiscountTypes: Record<
  OrderDiscountType,
  { label: () => string; color: MantineColor }
> = {
  [OrderDiscountType.DIRECT]: { label: () => t`Direct`, color: "gray" },
  [OrderDiscountType.USE_EXISTED_COMBO]: { label: () => t`Use existed combo`, color: "gray" },
  [OrderDiscountType.USE_DIRECT_COMBO]: { label: () => t`Use direct combo`, color: "gray" },
  [OrderDiscountType.COUPON]: { label: () => t`Coupon`, color: "gray" },
  [OrderDiscountType.VOUCHER]: { label: () => t`Voucher`, color: "gray" },
};
