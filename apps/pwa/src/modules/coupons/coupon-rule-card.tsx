"use client";

import { CouponRuleEntity } from "@/modules/coupons/coupon-types";
import { ModalCouponRuleForm } from "@/modules/coupons/modals/modal-coupon-rule-form";
import { ActionIcon, Anchor, Card, Group, Stack } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { FC } from "react";
import { CouponBenefits } from "./coupon-benefits";

interface CouponRuleCardProps {
  rule: CouponRuleEntity;
}

export const CouponRuleCard: FC<CouponRuleCardProps> = (props) => {
  const { rule } = props;
  return (
    <ModalCouponRuleForm>
      {(open) => (
        <Card shadow="xs" onClick={() => open({ rule })}>
          <Stack>
            <Group justify="space-between" align="start">
              <Stack gap={5}>
                <Anchor fw={500}>{rule.name}</Anchor>

                <CouponBenefits benefits={rule.benefits} />
              </Stack>

              <ActionIcon variant="subtle" color="gray">
                <IconPencil size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </Card>
      )}
    </ModalCouponRuleForm>
  );
};
