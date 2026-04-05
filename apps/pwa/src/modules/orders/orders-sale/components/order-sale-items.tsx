"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { QuantityInput } from "@/components/inputs/quantity-input";
import { ProductType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { productTypes } from "@/modules/products/products-constants";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, NumberInput, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBox, IconNote, IconPlus, IconTrash } from "@tabler/icons-react";
import { type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";
import { OrderItem } from "../../orders-management/orders-management-types";

export const OrderSaleItemComponent: FC<{
  index: number;
  item: OrderItem;
  onUpdate: (item: OrderItem) => void;
  onRemove: () => void;
}> = ({ index, item, onUpdate, onRemove }) => {
  const { t } = useLingui();
  const color = useColor();
  const { view } = useLayout();

  if (view === "mobile") {
    return (
      <ModalInput>
        {(openInput) => {
          return (
            <Card p={12} shadow="none" withBorder>
              <Stack>
                <Group gap={8} wrap="nowrap">
                  <Text w={18}>{index + 1}.</Text>
                  <Text fw={500} truncate="end" w={300}>
                    {item.product.displayName || item.product.name}
                  </Text>

                  <ActionIcon variant="subtle" color="gray" onClick={onRemove}>
                    <IconTrash size={14} strokeWidth={1.5} />
                  </ActionIcon>
                </Group>

                <Group justify="space-between">
                  <Group
                    gap={4}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      openInput({
                        title: item.note ? <Trans>Edit note</Trans> : <Trans>Add note</Trans>,
                        label: <Trans>Note</Trans>,
                        value: item.note,
                        type: InputModalType.TEXTAREA,
                        onDone: (value) => onUpdate({ ...item, note: value }),
                        onClear: () => onUpdate({ ...item, note: "" }),
                      });
                    }}
                  >
                    {!item.note ? (
                      <IconPlus size={12} color={color("blue")} />
                    ) : (
                      <IconNote size={12} color={color("blue")} />
                    )}

                    <Text fz={12} c={color("blue")}>
                      {item.note || <Trans>Note</Trans>}
                    </Text>
                  </Group>

                  <WorkspaceMembersInput
                    collapsed
                    value={item.assigneeUsers}
                    onChange={(value) => onUpdate({ ...item, assigneeUsers: value })}
                    tooltipLabel={
                      item.product.type === ProductType.Product ? (
                        <Trans>Assignee products revenue</Trans>
                      ) : (
                        <Trans>Assignee services revenue</Trans>
                      )
                    }
                  />
                </Group>

                <Group justify="space-between">
                  <Group gap={3}>
                    <NumberInput
                      variant="unstyled"
                      value={item.price}
                      hideControls
                      radius={0}
                      w={100}
                      readOnly={!item.product.minPrice || !item.product.maxPrice}
                      styles={{
                        input: {
                          fontSize: "1rem",
                          borderBottom: `1px solid ${color("gray.3")}`,
                        },
                      }}
                    />

                    {item.product.unit && (
                      <Group>
                        <Badge variant="light" color="gray" tt="initial">
                          /{item.product.unit}
                        </Badge>
                      </Group>
                    )}
                  </Group>

                  <Group gap={8} justify="end">
                    <QuantityInput
                      step={item.product.defaultQtyPerUse}
                      onChange={(value) => onUpdate({ ...item, quantity: value })}
                      value={item.quantity}
                    />
                  </Group>
                </Group>
              </Stack>
            </Card>
          );
        }}
      </ModalInput>
    );
  }

  return (
    <ModalInput>
      {(openInput) => (
        <Card p={8} shadow="xs" withBorder={false}>
          <Group justify="space-between">
            <Group gap={12} pl={8} wrap="nowrap">
              <Text w={18}>{index + 1}.</Text>

              <EntityImage
                src={item.product.image}
                icon={productTypes[item.product.type].icon}
                size={40}
                readonly
              />

              <Stack gap={0}>
                <Text fw={500} truncate="end" w={300}>
                  {item.product.displayName || item.product.name}
                </Text>

                <Group
                  gap={4}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    openInput({
                      title: item.note ? <Trans>Edit note</Trans> : <Trans>Add note</Trans>,
                      label: <Trans>Note</Trans>,
                      value: item.note,
                      type: InputModalType.TEXTAREA,
                      onDone: (value) => onUpdate({ ...item, note: value }),
                      onClear: () => onUpdate({ ...item, note: "" }),
                    });
                  }}
                >
                  {!item.note ? (
                    <IconPlus size={12} color={color("blue")} />
                  ) : (
                    <IconNote size={12} color={color("blue")} />
                  )}

                  <Text fz={12} c={color("blue")}>
                    {item.note || <Trans>Note</Trans>}
                  </Text>
                </Group>
              </Stack>
            </Group>

            <Group gap={20} justify="end">
              <WorkspaceMembersInput
                collapsed
                value={item.assigneeUsers}
                onChange={(value) => onUpdate({ ...item, assigneeUsers: value })}
                tooltipLabel={
                  item.product.type === ProductType.Product
                    ? t`Assignee products revenue`
                    : t`Assignee services revenue`
                }
              />

              <Group gap={8}>
                <QuantityInput
                  step={item.product.defaultQtyPerUse}
                  onChange={(value) => onUpdate({ ...item, quantity: value })}
                  value={item.quantity}
                />

                {item.product.unit && (
                  <Group w={70}>
                    <Badge variant="light" color="gray" tt="initial">
                      {item.product.unit}
                    </Badge>
                  </Group>
                )}
              </Group>

              <NumberInput
                variant="unstyled"
                value={item.price}
                hideControls
                radius={0}
                w={100}
                readOnly={!item.product.minPrice || !item.product.maxPrice}
                styles={{
                  input: {
                    textAlign: "right",
                    fontSize: "1rem",
                    borderBottom: `1px solid ${color("gray.3")}`,
                  },
                }}
              />

              <Text w={120} ta="right" pr={8} fw={500}>
                <CurrencyFormat value={item.price * item.quantity} />
              </Text>

              <ActionIcon variant="subtle" color="gray" onClick={onRemove}>
                <IconTrash size={14} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      )}
    </ModalInput>
  );
};

export const OrderSaleItems: FC = () => {
  const orderSale = userOrdersManagement();
  const { view } = useLayout();

  if (!orderSale.activeOrder) {
    return (
      <Stack h="100%" justify="center" align="center">
        <ThemeIcon color="gray" variant="light" size="xl">
          <IconBox />
        </ThemeIcon>
      </Stack>
    );
  }

  return (
    <Stack gap={8}>
      {orderSale.activeOrder.items.map((item, index) => {
        return (
          <OrderSaleItemComponent
            key={item.product._id + index}
            index={index}
            item={item}
            onUpdate={(item) => {
              if (item.quantity <= 0) return orderSale.removeProduct(item.product._id);
              return orderSale.updateProductItem(item.product._id, item);
            }}
            onRemove={() => orderSale.removeProduct(item.product._id)}
          />
        );
      })}

      <Stack gap={0}>
        {orderSale.activeOrder.items.length === 0 && (
          <Stack justify="center" align="center">
            <Empty message={<Trans>Add product/service to order</Trans>} hideBorder />
          </Stack>
        )}

        {view === "mobile" && (
          <Group justify="center" align="center" py={20}>
            <ProductSelector
              type={[ProductType.Product, ProductType.Service]}
              onSelect={(product) =>
                orderSale.addProduct({
                  ...product,
                  __typename: "OrderItemProduct",
                })
              }
              target={(ctx) => {
                return (
                  <Button leftIcon={IconPlus} variant="outline" color="gray" onClick={ctx.toggle}>
                    <Trans>Add product/service to order</Trans>
                  </Button>
                );
              }}
            />
          </Group>
        )}
      </Stack>
    </Stack>
  );
};
