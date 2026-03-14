"use client";

import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import { EventType } from "@/graphql/enums.graphql";
import { getOrderById } from "@/modules/orders/orders-service";
import { ProductComboHistoryEntity } from "@/modules/product-combos/product-combos-entity";
import {
  getProductCombo,
  productComboStatusOptions,
  revertProductComboHistory,
} from "@/modules/product-combos/product-combos-service";
import { productTypes } from "@/modules/products/products-constants";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
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
import { IconHistory, IconPackage, IconPlus, IconTrash } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";
import { ModalProductComboUsing } from "./modal-product-combo-using";

export interface ProductComboModalProps {
  id: string;
}

export const ModalProductCombo: FC<{
  children: (open: (args: ProductComboModalProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboModalProps | null>(null);
  const color = useColor();

  const combo = useFetch({
    id: propsRef.current?.id,
    skip: !!!propsRef.current?.id,
    fetch: () => getProductCombo(propsRef.current!.id),
    refetchEvents: [EventType.ProductComboUpdate],
  });

  const onRevertHistory = (historyId: string) => {
    onActionLoad({
      name: <Trans>Revert history</Trans>,
      icon: IconHistory,
      process: () => revertProductComboHistory(historyId),
    });
  };

  return (
    <ModalProductComboUsing>
      {(openProductComboUsing) => {
        return (
          <Fragment>
            {children((p) => {
              propsRef.current = p;
              open();
            })}

            <Modal
              opened={opened}
              onClose={close}
              title={<ModalHead name={<Trans>Combo</Trans>} icon={IconPackage} />}
              size="xl"
            >
              {(function () {
                if (combo.isFetching) return <Skeleton height={100} />;
                if (combo.error || !combo.data) return <Errored error={combo.error} />;
                const { icon: Icon } = productTypes[combo.data.product.type];

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
                                <NumberFormat value={ref.quantity - ref.quantityUsed} />/
                                <NumberFormat value={ref.quantity} />{" "}
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
                                openProductComboUsing({
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
                                <Table.Td>
                                  <DateFormat value={history.createdAt} type="date-time" />
                                </Table.Td>

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
                                            <NumberFormat value={record.quantity} />
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
          </Fragment>
        );
      }}
    </ModalProductComboUsing>
  );
};

const BindOrder: FC<{
  history: ProductComboHistoryEntity;
  onClose: () => void;
}> = ({ history, onClose }) => {
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
