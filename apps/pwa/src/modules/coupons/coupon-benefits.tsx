"use client";

import {
  CouponRuleBenefit,
  CouponRuleBenefitType,
  DiscountOnProductData,
  DiscountOnTotalData,
  DiscountType,
  FreeOnProductData,
} from "@/modules/coupons/coupon-types";
import { num, t } from "@/modules/lang/lang-service";
import { em, Text, TextProps } from "@mantine/core";
import { FC, Fragment } from "react";

interface CouponBenefitsProps extends TextProps {
  benefits: CouponRuleBenefit[];
}

export const CouponBenefits: FC<CouponBenefitsProps> = (props) => {
  let _props = { ...props } as any;
  delete _props.benefits;

  return (
    <Fragment>
      {props.benefits.map((benefit, i) => {
        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_TOTAL) {
          const data: DiscountOnTotalData = benefit.data;
          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              •{" "}
              {t("discount_on_total", {
                value: `${num(data.value)}${data.type === DiscountType.PERCENT ? "%" : ""}`.trim(),
              })}
            </Text>
          );
        }

        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_PRODUCT) {
          const data: DiscountOnProductData = benefit.data;
          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              •{" "}
              {t("discount_on_product", {
                value: `${num(data.value)}${data.type === DiscountType.PERCENT ? "%" : ""}`.trim(),
              })}
            </Text>
          );
        }

        if (benefit.type === CouponRuleBenefitType.FREE_ON_PRODUCT) {
          const data: FreeOnProductData = benefit.data;
          if (data.quantity && data.quantity > 0) {
            return (
              <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
                •{" "}
                {t("free_on_product_limit", {
                  product: data.product?.name,
                  quantity: data.quantity,
                  unit: data.product?.unit,
                })}
              </Text>
            );
          }

          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              • {t("free_on_product", { product: data.product?.name })}
            </Text>
          );
        }

        return null;
      })}
    </Fragment>
  );
};
