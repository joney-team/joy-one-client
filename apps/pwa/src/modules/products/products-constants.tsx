import { t } from "@lingui/core/macro";
import { ProductType } from "./products-types";

export const productTypes: Record<ProductType, { label: () => string }> = {
  [ProductType.PRODUCT]: { label: () => t`Product` },
  [ProductType.SERVICE]: { label: () => t`Service` },
  [ProductType.COMBO]: { label: () => t`Combo` },
  [ProductType.VOUCHER]: { label: () => t`Voucher` },
};
