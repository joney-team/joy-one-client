"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { Trans } from "@lingui/react/macro";
import { FC, Fragment } from "react";
import { PromotionEntity, PromotionType } from "../promotions-types";

export const PromotionDescription: FC<{ promotion: Pick<PromotionEntity, "type" | "value"> }> = ({
  promotion,
}) => {
  if (promotion.type === PromotionType.DISCOUNT_RATE) {
    return (
      <Fragment>
        <Trans>
          Discount <NumberFormat value={promotion.value} suffix="%" /> on total bill
        </Trans>
      </Fragment>
    );
  }

  if (promotion.type === PromotionType.DISCOUNT_AMOUNT) {
    return (
      <Fragment>
        <Trans>
          Discount <CurrencyFormat value={promotion.value} /> on total bill
        </Trans>
      </Fragment>
    );
  }

  return null;
};
