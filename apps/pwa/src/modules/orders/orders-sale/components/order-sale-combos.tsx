"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { NumberFormat, numberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import GetProductCombosByIdsDocument from "@/modules/product-combos/graphql/getProductCombosByIds.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useQuery } from "@apollo/client/react";
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
  const { availableCombos, availableCombosLoading, activeOrder, updateOrder } =
    userOrdersManagement();

  const { data: productCombosData } = useQuery(GetProductCombosByIdsDocument, {
    variables: {
      ids: activeOrder?.comboIds ?? [],
    },
  });

  const usedCombos = productCombosData?.combos ?? [];
  const unUsedCombos = availableCombos.filter((c) => !usedCombos.some((c2) => c2.id === c.id));

  if (!activeOrder) return null;

  return (
    <Group wrap="nowrap">
      <Text ta="left">
        <Trans>Combos</Trans>
      </Text>

      <Group flex={1} justify="end">
        {availableCombosLoading ? (
          <Skeleton h={25} w={80} visible />
        ) : usedCombos.length > 0 ? (
          <Indicator
            inline
            disabled={unUsedCombos.length === 0}
            label={`x${numberFormat(unUsedCombos.length)}`}
            size={16}
          >
            <Button
              size="xs"
              h={25}
              variant="outline"
              color={color(usedCombos.length > 0 ? "primary" : "gray")}
              fw={400}
              onClick={open}
            >
              <Trans>Apply</Trans> <NumberFormat value={usedCombos.length} />/
              <NumberFormat value={availableCombos.length} />
            </Button>
          </Indicator>
        ) : (
          "--"
        )}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalHead name={<Trans>Combos</Trans>} icon={IconPackage} />}
      >
        <Stack>
          {availableCombos.map((combo) => {
            const isActive = usedCombos.some((c) => c.id === combo.id);

            return (
              <ItemCard
                key={combo.id}
                name={combo.product.name}
                description={combo.productRefs.map((ref) => {
                  return (
                    <Group key={ref.productRefId} gap={8}>
                      <Text fz={16} c="dark" fw={400}>
                        • {ref.product.name}
                      </Text>

                      <Badge variant="light" color="dark">
                        <NumberFormat value={ref.quantity - ref.quantityUsed} />/
                        <NumberFormat value={ref.quantity} />
                      </Badge>
                    </Group>
                  );
                })}
                icon={IconPackage}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    updateOrder({
                      comboIds: activeOrder.comboIds?.filter((id) => id !== combo.id) ?? [],
                    });
                  } else {
                    updateOrder({
                      comboIds: [...(activeOrder.comboIds ?? []), combo.id],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={availableCombos.length === 0} />
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
