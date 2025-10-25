"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { num } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Badge,
  Card,
  Group,
  Indicator,
  Modal,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCheck, IconPackage } from "@tabler/icons-react";
import { ReactNode, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSaleCombos: FC = () => {
  const color = useColor();
  const [opened, { open, close }] = useDisclosure(false);
  const { availableCombos, activeOrder, updateOrder } = userOrdersManagement();

  const combos = [
    ...(availableCombos.data ?? []),
    ...(activeOrder?.prevCombos ?? []).filter(
      (c) => !availableCombos.data || !availableCombos.data.some((c2) => c2.id === c.id)
    ),
  ];

  const orderCombos = activeOrder?.combos ?? [];
  const unUsedCombos = combos.filter((c) => !orderCombos.some((c2) => c2.id === c.id));

  if (!activeOrder) return null;

  return (
    <Group wrap="nowrap">
      <Text ta="left">
        <Trans>Combos</Trans>
      </Text>

      <Group flex={1} justify="end">
        {availableCombos.isLoading ? (
          <Skeleton h={25} w={80} visible />
        ) : combos.length > 0 ? (
          <Indicator
            inline
            disabled={unUsedCombos.length === 0}
            label={`x${num(unUsedCombos.length)}`}
            size={16}
          >
            <Button
              size="xs"
              h={25}
              variant="outline"
              color={color(orderCombos.length > 0 ? "primary" : "gray")}
              fw={400}
              onClick={open}
            >
              <Trans>Apply</Trans> {num(orderCombos.length)}/{num(combos.length ?? 0)}
            </Button>
          </Indicator>
        ) : (
          "--"
        )}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={t`Combos`} icon={IconPackage} />}
      >
        <Stack>
          {combos.map((combo) => {
            const isActive = orderCombos.some((c) => c.id === combo.id);

            return (
              <ItemCard
                key={combo.id}
                name={combo.product.name}
                description={combo.productRefs.map((ref) => {
                  return (
                    <Group key={ref.productRefId} gap={8}>
                      <Text fz={16} c="dark" fw={400}>
                        • {ref.productRef.name}
                      </Text>

                      <Badge variant="light" color="dark">
                        {num(ref.quantity - ref.quantityUsed)}/{num(ref.quantity)}
                      </Badge>
                    </Group>
                  );
                })}
                icon={IconPackage}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    updateOrder({
                      combos: orderCombos.filter((c) => c.id !== combo.id),
                    });
                  } else {
                    updateOrder({
                      combos: [...orderCombos, combo],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={combos.length === 0} />
        </Stack>
      </Modal>
    </Group>
  );
};

const ItemCard: FC<{
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
