import { t } from "@lingui/core/macro";
import { CouponRuleBenefitType, DiscountType } from "./coupon-types";

export const couponRuleBenefitTypes: Record<CouponRuleBenefitType, { label: () => string }> = {
  [CouponRuleBenefitType.DISCOUNT_ON_TOTAL]: { label: () => t`Discount on total bill` },
  [CouponRuleBenefitType.DISCOUNT_ON_PRODUCT]: { label: () => t`Discount on product` },
  [CouponRuleBenefitType.FREE_ON_PRODUCT]: { label: () => t`Free on product` },
};

export const discountTypes: Record<DiscountType, { label: () => string }> = {
  [DiscountType.PERCENT]: { label: () => t`Percent` },
  [DiscountType.AMOUNT]: { label: () => t`Amount` },
};
