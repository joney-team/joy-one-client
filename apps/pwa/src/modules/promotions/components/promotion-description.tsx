"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { PromotionType } from "@/graphql/enums.graphql";
import { Trans } from "@lingui/react/macro";
import { FC } from "react";
import { PromotionFragment } from "../graphql/fragmentPromotion.graphql";

export const PromotionDescription: FC<{ promotion: Pick<PromotionFragment, "type" | "value"> }> = ({
  promotion,
}) => {
  if (promotion.type === PromotionType.DiscountRate) {
    return (
      <Trans>
        Discount <NumberFormat value={promotion.value} suffix="%" /> on total bill
      </Trans>
    );
  }

  if (promotion.type === PromotionType.DiscountAmount) {
    return (
      <Trans>
        Discount <CurrencyFormat value={promotion.value} /> on total bill
      </Trans>
    );
  }

  return null;
};
