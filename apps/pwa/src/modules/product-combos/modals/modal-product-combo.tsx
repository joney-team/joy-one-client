"use client";

import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import { EventType } from "@/modules/events/event-types";
import { num, renderDateTime } from "@/modules/lang/lang-service";
import { getOrderById } from "@/modules/orders/orders-service";
import { OnModalProductComboUsing } from "@/modules/product-combos/modals/modal-product-combo-using";
import { ProductComboHistoryEntity } from "@/modules/product-combos/product-combos-entity";
import {
  getProductCombo,
  productComboStatusOptions,
  revertProductComboHistory,
} from "@/modules/product-combos/product-combos-service";
import { productTypeOptions } from "@/modules/products/products-service";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Modal,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPackage, IconPlus, IconTrash } from "@tabler/icons-react";
import { FC, useRef } from "react";

export interface ProductComboModalProps {
  id: string;
}

export let OnModalProductCombo: (props: ProductComboModalProps) => void = () => {};

export const ModalProductCombo: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboModalProps | null>(null);
  const color = useColor();

  const combo = useFetch({
    id: propsRef.current?.id,
    skip: !!!propsRef.current?.id,
    fetch: () => getProductCombo(propsRef.current!.id),
    refetchEvents: [EventType.PRODUCT_COMBO_UPDATE],
  });

  const onRevertHistory = (historyId: string) => {
    onActionLoad({
      process: () => revertProductComboHistory(historyId),
    });
  };

  OnModalProductCombo = (p) => {
    propsRef.current = p;
    open();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle title={t`Combo`} icon={IconPackage} />}
      size="xl"
    >
      {(function () {
        if (combo.isFetching) return <Skeleton height={100} />;
        if (combo.error || !combo.data) return <Errored error={combo.error} />;
        const Icon = productTypeOptions[combo.data.product.type].icon;

        return (
          <Stack>
            <Group align="start">
              <EntityImage src={combo.data.product.image} icon={Icon} size={80} />
              <Stack gap={8}>
                <Text fw={600}>{combo.data.product.name}</Text>

                {combo.data.productRefs.map((ref) => {
                  const statusOptions = productComboStatusOptions[combo.data!.status];

                  return (
                    <Group key={ref.productRefId} gap={8}>
                      <Text fz={16} c="dark" fw={400}>
                        • {ref.productRef.name}
                      </Text>

                      <Badge variant="light" color={color(statusOptions.color)}>
                        {num(ref.quantity - ref.quantityUsed)}/{num(ref.quantity)}
                      </Badge>
                    </Group>
                  );
                })}
              </Stack>
            </Group>

            <Table
              mt={16}
              captionSide="bottom"
              withTableBorder
              withRowBorders
              withColumnBorders
              striped
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Trans>Time</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Order</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Note</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>History</Trans>
                  </Table.Th>
                  <Table.Th w={50}>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={() => {
                        OnModalProductComboUsing({
                          combo: combo.data!,
                        });
                      }}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              {combo.data.history.length > 0 && (
                <Table.Tbody>
                  {combo.data.history.map((history) => {
                    return (
                      <Table.Tr key={history.id}>
                        <Table.Td>{renderDateTime(history.createdAt)}</Table.Td>

                        <Table.Td>
                          <BindOrder history={history} onClose={close} />
                        </Table.Td>

                        <Table.Td>{history.note || "-"}</Table.Td>

                        <Table.Td>
                          <Stack gap={5}>
                            {history.records.map((record) => {
                              const product = combo.data!.productRefs.find(
                                (ref) => ref.productRefId === record.productRefId
                              )?.productRef;

                              return (
                                <Group key={record.productRefId}>
                                  <Text fz={16} c="dark" fw={400}>
                                    • {product?.name}
                                  </Text>

                                  <Badge
                                    variant="light"
                                    color={color(record.quantity >= 0 ? "primary" : "red")}
                                  >
                                    {num(record.quantity)}
                                  </Badge>
                                </Group>
                              );
                            })}
                          </Stack>
                        </Table.Td>

                        <Table.Td>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="gray"
                            onClick={() => onRevertHistory(history.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              )}

              {combo.data.history.length === 0 && (
                <Table.Caption>
                  <Empty />
                </Table.Caption>
              )}
            </Table>
          </Stack>
        );
      })()}
    </Modal>
  );
};

const BindOrder: FC<{
  history: ProductComboHistoryEntity;
  onClose: () => void;
}> = ({ history, onClose }) => {
  console.log("history", history);
  const order = useFetch({
    id: history.orderId,
    skip: !!!history.orderId,
    fetch: async () => getOrderById(history.orderId!),
  });

  if (!order.data) return null;

  return (
    <Anchor href={`/orders/${order.data.code}`} onClick={onClose}>
      {order.data.code}
    </Anchor>
  );
};
