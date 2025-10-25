"use client";

import {
  CouponRuleBenefit,
  CouponRuleBenefitType,
  DiscountOnProductData,
  DiscountOnTotalData,
  DiscountType,
  FreeOnProductData,
} from "@/modules/coupons/coupon-types";
import { num } from "@/modules/lang/lang-service";
import { Trans } from "@lingui/react/macro";
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
              <Trans>
                Discount{" "}
                {`${num(data.value)}${data.type === DiscountType.PERCENT ? "%" : ""}`.trim()} on
                total bill
              </Trans>
            </Text>
          );
        }

        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_PRODUCT) {
          const data: DiscountOnProductData = benefit.data;
          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              •{" "}
              <Trans>
                Discount{" "}
                {`${num(data.value)}${data.type === DiscountType.PERCENT ? "%" : ""}`.trim()} on
                product {data.product?.name}
              </Trans>
            </Text>
          );
        }

        if (benefit.type === CouponRuleBenefitType.FREE_ON_PRODUCT) {
          const data: FreeOnProductData = benefit.data;
          if (data.quantity && data.quantity > 0) {
            return (
              <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
                •{" "}
                <Trans>
                  Free {data.product?.name} maximum x{data.quantity} {data.product?.unit}
                </Trans>
              </Text>
            );
          }

          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              • <Trans>Free {data.product?.name}</Trans>
            </Text>
          );
        }

        return null;
      })}
    </Fragment>
  );
};
