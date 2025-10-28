"use client";

import { EntityImage } from "@/components/entity-image";
import { NumberFormat } from "@/components/format/number-format";
import { getCouponCode } from "@/modules/coupons/coupon-service";
import { CouponEntity } from "@/modules/coupons/coupon-types";
import { Trans } from "@lingui/react/macro";
import { Card, CardProps, em, Group, Stack, Text } from "@mantine/core";
import { IconTicket } from "@tabler/icons-react";
import { FC } from "react";
import { CouponBenefits } from "./coupon-benefits";

interface CouponCardProps {
  coupon: CouponEntity;
  cardProps?: CardProps;
  onClick?: () => void;
  hideQuantity?: boolean;
  hideCustomer?: boolean;
  hideCode?: boolean;
}

export const CouponCard: FC<CouponCardProps> = (props) => {
  const { coupon } = props;
  return (
    <Card shadow="xs" p={8} onClick={props.onClick} {...props.cardProps}>
      <Group justify="space-between" align="start" gap={10}>
        <EntityImage icon={IconTicket} size={44} />

        <Stack gap={5} flex={1}>
          <Text fw={500}>{coupon.rule.name}</Text>

          {!props.hideQuantity && (
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Quantity</Trans>: <NumberFormat value={coupon.quantity} />
            </Text>
          )}
          {!props.hideCode && (
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Code</Trans>: {getCouponCode(coupon) || "--"}
            </Text>
          )}
          {!props.hideCustomer && !!coupon.customer && (
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Customer</Trans>: {coupon.customer?.name || "--"}
            </Text>
          )}

          <CouponBenefits benefits={coupon.rule.benefits} />
        </Stack>
      </Group>
    </Card>
  );
};
