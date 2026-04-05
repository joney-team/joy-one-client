"use client";

import { Badge } from "@/components/badge";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import GetOrderByIdDocument from "@/modules/orders/graphql/getOrderById.graphql";
import { productTypes } from "@/modules/products/products-constants";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad } from "@/utils/actions";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Anchor, Group, Modal, Skeleton, Stack, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHistory, IconPackage, IconPlus, IconTrash } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";
import { ProductComboFragment } from "../graphql/fragmentProductCombo.graphql";
import GetProductComboDocument from "../graphql/getProductCombo.graphql";
import RevertProductComboHistoryDocument from "../graphql/revertProductComboHistory.graphql";
import { productComboStatuses } from "../product-combos-constants";
import { ModalProductComboUsing } from "./modal-product-combo-using";

export interface ProductComboModalProps {
  id: string;
}

export const ModalProductCombo: FC<{
  children: (open: (args: ProductComboModalProps) => void) => ReactNode;
}> = ({ children }) => {
  const client = useApolloClient();
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboModalProps | null>(null);
  const color = useColor();

  const { data, loading, error } = useQuery(GetProductComboDocument, {
    variables: {
      comboId: propsRef.current?.id ?? "",
    },
    skip: !!!propsRef.current?.id,
    fetchPolicy: "cache-and-network",
  });

  const onRevertHistory = (historyId: string) => {
    onActionLoad({
      name: <Trans>Revert history</Trans>,
      icon: IconHistory,
      process: () =>
        client.mutate({
          mutation: RevertProductComboHistoryDocument,
          variables: { historyId },
        }),
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
                if (loading && !data) return <Skeleton height={100} />;
                if (error || !data) return <Errored error={error} />;

                const combo = data.getProductCombo;
                const { icon: Icon } = productTypes[combo.product.type];

                return (
                  <Stack>
                    <Group align="start">
                      <EntityImage src={combo.product.image} icon={Icon} size={80} />
                      <Stack gap={8}>
                        <Text fw={600}>{combo.product.name}</Text>

                        {combo.productRefs.map((ref) => {
                          const statusOptions = productComboStatuses[combo.status];

                          return (
                            <Group key={ref.productRefId} gap={8}>
                              <Text fz={16} c="dark" fw={400}>
                                • {ref.product.name}
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
                                  combo,
                                });
                              }}
                            >
                              <IconPlus size={16} />
                            </ActionIcon>
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      {combo.history.length > 0 && (
                        <Table.Tbody>
                          {combo.history.map((history) => {
                            return (
                              <Table.Tr key={history.id}>
                                <Table.Td>
                                  {history.createdAt && (
                                    <DateFormat value={history.createdAt} type="date-time" />
                                  )}
                                </Table.Td>

                                <Table.Td>
                                  <BindOrder history={history} onClose={close} />
                                </Table.Td>

                                <Table.Td>{history.note || "-"}</Table.Td>

                                <Table.Td>
                                  <Stack gap={5}>
                                    {history.records?.map((record) => {
                                      const product = combo!.productRefs.find(
                                        (ref) => ref.productRefId === record.productRefId,
                                      )?.product;

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

                      {combo.history.length === 0 && (
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
  history: ProductComboFragment["history"][number];
  onClose: () => void;
}> = ({ history, onClose }) => {
  const { data } = useQuery(GetOrderByIdDocument, {
    variables: {
      orderId: history.orderId ?? "",
    },
  });

  if (!data) return null;

  return (
    <Anchor href={`/orders/${data.order.code}`} onClick={onClose}>
      {data.order.code}
    </Anchor>
  );
};
