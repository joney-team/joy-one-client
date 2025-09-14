"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { type FC } from "react";
import { useOrderSale } from "../order-sale-context";
import { OrderSaleItem } from "../order-sale-types";
import { IconBox, IconMinus, IconPlus } from "@tabler/icons-react";
import { EntityImage } from "@/components/entity-image";
import { getProductIcon } from "@/modules/products/products-service";
import { useColor } from "@/modules/theme/use-color";
import { num, t } from "@/modules/lang/lang-service";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { ProductType } from "@/modules/products/products-types";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { Empty } from "@/components/empty";

export const OrderSaleItemComponent: FC<{
  index: number;
  item: OrderSaleItem;
  onUpdate: (item: OrderSaleItem) => void;
  onRemove: () => void;
}> = ({ index, item, onUpdate, onRemove }) => {
  const color = useColor();

  const onChangeNote = () => {
    OnModalInput({
      title: `${t(item.note ? "edit" : "add")} ${t("note")}`,
      label: t("note").toString(),
      value: item.note,
      type: InputModalType.TEXTAREA,
      onDone: (value) =>
        onUpdate({
          ...item,
          note: value,
        }),
      onClear: () =>
        onUpdate({
          ...item,
          note: "",
        }),
    });
  };

  const onIncrease = () => {
    onUpdate({
      ...item,
      quantity: item.quantity + (item.product.defaultQtyPerUse || 1),
    });
  };

  const onDecrease = () => {
    const tempQuantity = item.quantity - (item.product.defaultQtyPerUse || 1);
    if (tempQuantity <= 0) return onRemove();

    onUpdate({
      ...item,
      quantity: item.quantity - (item.product.defaultQtyPerUse || 1),
    });
  };

  return (
    <Card shadow="xs" withBorder={false} p={8}>
      <Group justify="space-between">
        <Group gap={12} pl={8}>
          <Text w={18}>{index + 1}.</Text>
          <EntityImage
            src={item.product.image}
            size={40}
            onlyRead
            icon={getProductIcon(item.product.type)}
          />

          <Stack gap={0}>
            <Text fw={500} truncate="end" w={300}>
              {item.product.displayName || item.product.name}
            </Text>
            <Group>
              <Tooltip label={t(item.note ? "change_note" : "add_note")}>
                <Group gap={4} style={{ cursor: "pointer" }} onClick={onChangeNote}>
                  {!item.note && <IconPlus size={12} color={color("blue")} />}
                  <Text fz={12} c={color("blue")}>
                    {item.note || t("note")}
                  </Text>
                </Group>
              </Tooltip>
            </Group>
          </Stack>
        </Group>

        <Group gap={30} justify="end">
          <WorkspaceMembersInput
            collapsed
            value={item.assigneeUsers}
            onChange={(value) => onUpdate({ ...item, assigneeUsers: value })}
            tooltipLabel={
              item.product.type === ProductType.PRODUCT
                ? t("assignee_products_revenue").toString()
                : t("assignee_services_revenue").toString()
            }
          />

          {item.product.unit && (
            <Badge variant="light" color="gray">
              {item.product.unit}
            </Badge>
          )}

          <Card
            py={0}
            px={3}
            bg="gray.1"
            shadow="none"
            style={{
              borderRadius: 100,
            }}
          >
            <Group wrap="nowrap" gap={0}>
              <ActionIcon color="gray.4" radius={100} onClick={onDecrease}>
                <IconMinus size={16} strokeWidth={1.5} />
              </ActionIcon>

              <NumberInput
                hideControls
                value={item.quantity}
                onChange={(value) => {
                  if (!value || Number.isNaN(value) || +value <= 0) return;
                  onUpdate({ ...item, quantity: +value });
                }}
                min={0}
                maw={60}
                step={item.product.defaultQtyPerUse || 1}
                styles={{
                  input: {
                    textAlign: "center",
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                  },
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (+value === 0) {
                    onUpdate({ ...item, quantity: 0 });
                  }
                }}
              />

              <ActionIcon color={color("primary.3")} radius={100} onClick={onIncrease}>
                <IconPlus size={16} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          </Card>

          <NumberInput
            variant="unstyled"
            value={item.price}
            hideControls
            radius={0}
            w={150}
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
            {num(item.price * item.quantity, { type: "money" })}
          </Text>
        </Group>
      </Group>
    </Card>
  );
};

export const OrderSaleItems: FC = () => {
  const orderSale = useOrderSale();

  if (!orderSale.activeOrder)
    return (
      <Stack flex={1} h="100%" justify="center" align="center">
        <ThemeIcon color="gray" variant="light" size="xl">
          <IconBox />
        </ThemeIcon>
      </Stack>
    );

  return (
    <Stack flex={1} h="100%" gap={8} p={12}>
      {orderSale.activeOrder.items.map((item, index) => {
        return (
          <OrderSaleItemComponent
            key={item.product._id}
            index={index}
            item={item}
            onUpdate={(item) => orderSale.updateProductItem(item.product._id, item)}
            onRemove={() => orderSale.removeProduct(item.product._id)}
          />
        );
      })}

      {orderSale.activeOrder.items.length === 0 && (
        <Stack flex={1} justify="center" align="center">
          <Empty message="add_product_to_order" hideBorder />
        </Stack>
      )}
    </Stack>
  );
};
