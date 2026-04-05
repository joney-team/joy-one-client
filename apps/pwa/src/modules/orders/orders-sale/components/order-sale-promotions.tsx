"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { NumberFormat, numberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import { PromotionDescription } from "@/modules/promotions/components/promotion-description";
import GetPromotionsByIdsDocument from "@/modules/promotions/graphql/getPromotionsByIds.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Indicator, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCheck, IconPackage } from "@tabler/icons-react";
import { ReactNode, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";
import { Modal } from "@/components/modal/modal";

export const OrderSalePromotions: FC = () => {
  const { getAvailableModule } = useAvailableWorkspaceModules();
  const workspaceModule = getAvailableModule("promotions");
  const color = useColor();
  const [opened, { open, close }] = useDisclosure(false);
  const { availablePromotions, availablePromotionsLoading, activeOrder, updateOrder } =
    userOrdersManagement();

  const { data: promotionsData } = useQuery(GetPromotionsByIdsDocument, {
    variables: {
      ids: activeOrder?.promotionIds ?? [],
    },
  });

  const usedPromotions = promotionsData?.promotions ?? [];
  const unUsedPromotions = availablePromotions.filter(
    (c) => !usedPromotions.some((c2) => c2.id === c.id),
  );

  if (!activeOrder || !workspaceModule) return null;

  return (
    <Group wrap="nowrap">
      <Text ta="left">
        <Trans>Promotions</Trans>
      </Text>

      <Group flex={1} justify="end">
        {availablePromotionsLoading ? (
          <Skeleton h={25} w={80} visible />
        ) : usedPromotions.length > 0 ? (
          <Indicator
            inline
            disabled={unUsedPromotions.length === 0}
            label={`x${numberFormat(unUsedPromotions.length)}`}
            size={16}
          >
            <Button
              size="xs"
              h={25}
              variant="outline"
              color={color(usedPromotions.length > 0 ? "primary" : "gray")}
              fw={400}
              onClick={open}
            >
              <Trans>Apply</Trans> <NumberFormat value={usedPromotions.length} />/
              <NumberFormat value={availablePromotions.length} />
            </Button>
          </Indicator>
        ) : (
          "--"
        )}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        name={<Trans>Promotions</Trans>}
        icon={IconPackage}
        size={500}
      >
        <Stack>
          {availablePromotions.map((promotion) => {
            const isActive = usedPromotions.some((c) => c.id === promotion.id);

            return (
              <PromotionCard
                key={promotion.id}
                name={promotion.name}
                description={<PromotionDescription promotion={promotion} />}
                icon={workspaceModule.icon}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    updateOrder({
                      promotionIds: activeOrder.promotionIds?.filter((c) => c !== promotion.id),
                    });
                  } else {
                    updateOrder({
                      promotionIds: [...(activeOrder.promotionIds ?? []), promotion.id],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={availablePromotions.length === 0} />
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
        <EntityImage src={props.image} w={70} h={70} readonly icon={props.icon} />

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
