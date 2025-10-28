"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import {
  CouponRuleBenefit,
  CouponRuleBenefitType,
  DiscountOnProductData,
  DiscountOnTotalData,
  DiscountType,
  FreeOnProductData,
} from "@/modules/coupons/coupon-types";
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
          const value = data.value ? (
            data.type === DiscountType.PERCENT ? (
              <NumberFormat value={data.value} suffix="%" />
            ) : (
              <CurrencyFormat value={data.value} />
            )
          ) : null;

          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              • <Trans>Discount {value} on total bill</Trans>
            </Text>
          );
        }

        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_PRODUCT) {
          const data: DiscountOnProductData = benefit.data;
          const value = data.value ? (
            data.type === DiscountType.PERCENT ? (
              <NumberFormat value={data.value} suffix="%" />
            ) : (
              <CurrencyFormat value={data.value} />
            )
          ) : null;

          return (
            <Text key={i} fw={500} fz={em(13)} c="gray" {..._props}>
              •{" "}
              <Trans>
                Discount {value} on product {data.product?.name}
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
