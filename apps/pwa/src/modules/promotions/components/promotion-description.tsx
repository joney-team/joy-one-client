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
        <Trans>Promotion discount</Trans>
        {": "}
        <NumberFormat value={promotion.value} suffix="%" />
      </Fragment>
    );
  }

  if (promotion.type === PromotionType.DISCOUNT_AMOUNT) {
    return (
      <Fragment>
        <Trans>Promotion discount</Trans>
        {": "}
        <CurrencyFormat value={promotion.value} />
      </Fragment>
    );
  }

  return null;
};
