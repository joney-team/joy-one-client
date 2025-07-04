import { DynamicSelectionOperator } from "@/types";
import { MantineColor } from "@mantine/core";
import { Icon, IconDiscount, IconFreeRights } from "@tabler/icons-react";
import { num, renderDateTime, t } from "../lang/lang-service";
import { PromotionEntity, PromotionStatus, PromotionType } from "./promotions-types";

export const promotionRuleTypeConfigs: Record<PromotionType, {
  label: string;
  icon: Icon;
  color: MantineColor;
}> = {
  [PromotionType.DISCOUNT_RATE]: {
    label: 'discount_rate',
    icon: IconDiscount,
    color: "indigo",
  },
  [PromotionType.DISCOUNT_AMOUNT]: {
    label: "discount_amount",
    icon: IconFreeRights,
    color: "green",
  },
};

export const promotionRuleValueConfig: Record<PromotionType, {
  label: string;
  min?: number;
  max?: number;
}> = {
  [PromotionType.DISCOUNT_RATE]: {
    label: "rate",
    min: 0,
    max: 100,
  },
  [PromotionType.DISCOUNT_AMOUNT]: {
    label: "money_amount",
    min: 0,
  },
};

export const promotionStatusConfigs: Record<PromotionStatus, {
  label: string;
  color: MantineColor;
}> = {
  [PromotionStatus.ACTIVE]: {
    label: "active",
    color: "green",
  },
  [PromotionStatus.CLOSED]: {
    label: "closed",
    color: "red",
  },
  [PromotionStatus.EXPIRED]: {
    label: "expired",
    color: "gray",
  },
};

export const promotionDescription = (promotion: PromotionEntity) => {
  if (promotion.type === PromotionType.DISCOUNT_RATE) {
    return t('promotion_discount', {
      value: num(promotion.value) + '%',
    });
  }

  if (promotion.type === PromotionType.DISCOUNT_AMOUNT) {
    return t('promotion_discount', {
      value: num(promotion.value, { type: "money" }),
    });
  }

  return '';
}

export const promotionTermsOfUseCustomerLimit = (promotion: PromotionEntity) => {
  if (!promotion.customersSelection || promotion.customersSelection.value.length === 0) {
    return t('unlimited_customers');
  }

  if (promotion.customersSelection.operator === DynamicSelectionOperator.INCLUDES) {
    return t('includes_customers') + ': ' + promotion.customersSelection.value.map((c) => c.name).join(', ');
  }

  if (promotion.customersSelection.operator === DynamicSelectionOperator.EXCLUDES) {
    return t('excludes_customers') + ': ' + promotion.customersSelection.value.map((c) => c.name).join(', ');
  }
}

export const promotionTermsOfUseExpireAt = (promotion: PromotionEntity) => {
  return `${t('expireAt')}: ${promotion.expireAt && promotion.expireAt > 0 ? renderDateTime(promotion.expireAt) : t('unlimited')}`;
}