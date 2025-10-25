import { t } from "@lingui/core/macro";
import { ProductComboStatus } from "./product-combos-types";
import { MantineColor } from "@mantine/core";

export const productComboStatuses: Record<
  ProductComboStatus,
  { label: () => string; color: MantineColor }
> = {
  [ProductComboStatus.ACTIVE]: { label: () => t`Active`, color: "green" },
  [ProductComboStatus.INACTIVE]: { label: () => t`Inactive`, color: "gray" },
  [ProductComboStatus.EXPIRED]: { label: () => t`Expired`, color: "red" },
  [ProductComboStatus.OUT_OF_STOCK]: { label: () => t`Out of stock`, color: "gray" },
  [ProductComboStatus.SOURCE_UNAVAILABLE]: { label: () => t`Source unavailable`, color: "red" },
};
