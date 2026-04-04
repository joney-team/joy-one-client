import { ProductType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { Icon, IconBox, IconCategory2, IconGiftCard, IconPackage } from "@tabler/icons-react";

export const productTypes: Record<
  ProductType,
  { label: MacroMessageDescriptor; icon: Icon; defaultUnit?: MacroMessageDescriptor }
> = {
  [ProductType.Product]: {
    label: defineMessage`Product`,
    icon: IconBox,
  },
  [ProductType.Service]: { label: defineMessage`Service`, icon: IconCategory2 },
  [ProductType.Combo]: {
    label: defineMessage`Combo`,
    icon: IconPackage,
    defaultUnit: defineMessage`Combo`,
  },
  [ProductType.Voucher]: {
    label: defineMessage`Voucher`,
    icon: IconGiftCard,
    defaultUnit: defineMessage`Voucher`,
  },
};
