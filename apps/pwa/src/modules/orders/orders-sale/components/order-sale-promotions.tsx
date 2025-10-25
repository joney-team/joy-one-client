"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { num } from "@/modules/lang/lang-service";
import { promotionDescription } from "@/modules/promotions/promotions-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Indicator, Modal, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCheck, IconPackage } from "@tabler/icons-react";
import { ReactNode, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSalePromotions: FC = () => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("promotions");
  const color = useColor();
  const [opened, { open, close }] = useDisclosure(false);
  const { availablePromotions, activeOrder, updateOrder } = userOrdersManagement();

  const promotions = [
    ...(availablePromotions.data?.data ?? []),
    ...(activeOrder?.prevPromotions ?? []).filter(
      (c) =>
        !availablePromotions.data?.data ||
        !availablePromotions.data?.data.some((c2) => c2.id === c.id)
    ),
  ];

  const orderPromotions = activeOrder?.promotions ?? [];
  const unUsedPromotions = promotions.filter((c) => !orderPromotions.some((c2) => c2.id === c.id));

  if (!activeOrder) return null;

  return (
    <Group wrap="nowrap">
      <Text ta="left">
        <Trans>Promotions</Trans>
      </Text>

      <Group flex={1} justify="end">
        {availablePromotions.isLoading ? (
          <Skeleton h={25} w={80} visible />
        ) : promotions.length > 0 ? (
          <Indicator
            inline
            disabled={unUsedPromotions.length === 0}
            label={`x${num(unUsedPromotions.length)}`}
            size={16}
          >
            <Button
              size="xs"
              h={25}
              variant="outline"
              color={color(orderPromotions.length > 0 ? "primary" : "gray")}
              fw={400}
              onClick={open}
            >
              <Trans>Apply</Trans> {num(orderPromotions.length)}/{num(promotions.length ?? 0)}
            </Button>
          </Indicator>
        ) : (
          "--"
        )}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={t`Promotions`} icon={IconPackage} />}
      >
        <Stack>
          {promotions.map((promotion) => {
            const isActive = orderPromotions.some((c) => c.id === promotion.id);

            return (
              <PromotionCard
                key={promotion.id}
                name={promotion.name}
                description={promotionDescription(promotion)}
                icon={mod.icon}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    updateOrder({
                      promotions: orderPromotions.filter((c) => c.id !== promotion.id),
                    });
                  } else {
                    updateOrder({
                      promotions: [...orderPromotions, promotion],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={promotions.length === 0} />
        </Stack>
      </Modal>
    </Group>
  );
};

const PromotionCard: FC<{
  name: string;
  description: ReactNode;
  icon: Icon;
  isActive: boolean;
  image?: string;
  onClick?: () => void;
}> = (props) => {
  const color = useColor();

  return (
    <Card
      withBorder
      shadow="none"
      className="unselectable"
      onClick={props.onClick}
      style={{
        cursor: "pointer",
        borderColor: props.isActive ? color("primary") : undefined,
      }}
      p={10}
    >
      <Group wrap="nowrap">
        <EntityImage src={props.image} w={70} h={70} onlyRead icon={props.icon} />

        <Stack flex={1} gap={8}>
          <Text fz={16} c="dark" fw={600}>
            {props.name}
          </Text>

          <Stack gap={5}>{props.description}</Stack>
        </Stack>

        {props.isActive ? (
          <ThemeIcon color={color("primary")} radius={100}>
            <IconCheck size={18} />
          </ThemeIcon>
        ) : (
          <Button radius={100} size="xs">
            <Trans>Apply</Trans>
          </Button>
        )}
      </Group>
    </Card>
  );
};
