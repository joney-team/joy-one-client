import { MantineColor } from "@mantine/core";
import { ProductVoucherStatus } from "./product-vouchers-types";
import { t } from "@lingui/core/macro";

export const productVoucherStatuses: Record<
  ProductVoucherStatus,
  { label: () => string; color: MantineColor }
> = {
  [ProductVoucherStatus.ACTIVE]: { label: () => t`Active`, color: "green" },
  [ProductVoucherStatus.INACTIVE]: { label: () => t`Inactive`, color: "gray" },
  [ProductVoucherStatus.EXPIRED]: { label: () => t`Expired`, color: "red" },
  [ProductVoucherStatus.OUT_OF_AMOUNT]: { label: () => t`Out of amount`, color: "gray" },
};
