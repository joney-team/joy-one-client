import { useColor } from "@/modules/theme/use-color";
import { EntityImage } from "@/components/entity-image";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { num, t, tMulti } from "@/modules/lang/lang-service";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductType } from "@/modules/products/products-types";
import { ActionIcon, Card, Group, NumberInput, Stack, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { UsersInput } from "@/components/inputs/users-input";
import { useOrderTable } from "../order-table-context";
import { OrderTableFormValueItem } from "../order-table-types";

export const OrderFormItem: FC<{ index: number; item: OrderTableFormValueItem }> = ({ index, item }) => {
  const Icon = getProductIcon(item.product.type);
  const color = useColor();
  const orderForm = useOrderTable();

  const onUpdate = (_item: OrderTableFormValueItem) => {
    if (_item.quantity <= 0) {
      orderForm.removeProduct(item.product);
    } else {
      orderForm.updateItem(index, _item);
    }
  };

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

  const onChangePrice = () => {
    OnModalInput({
      title: tMulti(["change"], ["price"]),
      type: InputModalType.MONEY,
      label: "price",
      icon: IconPencil,
      args: {
        min: item.product.minPrice,
        max: item.product.maxPrice,
      },
      value: item.price,
      onDone: (value) =>
        onUpdate({
          ...item,
          price: value,
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
    onUpdate({
      ...item,
      quantity: item.quantity - (item.product.defaultQtyPerUse || 1),
    });
  };

  return (
    <Group align="start">
      <EntityImage src={item.product.image} w={80} h={80} onlyRead icon={Icon} />
      <Stack gap={3} flex={1}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600}>{item.product.displayName || item.product.name}</Text>

          <UsersInput
            collapsed
            value={item.assigneeUsers}
            onChange={(value) => onUpdate({ ...item, assigneeUsers: value })}
            avatarSize={30}
            iconSize={36}
            mr={5}
            tooltipLabel={
              item.product.type === ProductType.PRODUCT
                ? t("assignee_products_revenue").toString()
                : t("assignee_services_revenue").toString()
            }
          />
        </Group>

        <Group>
          <Tooltip label={tMulti([item.note ? "change" : "add"], ["note"])}>
            <Group gap={4} style={{ cursor: "pointer" }} onClick={onChangeNote}>
              {!item.note && <IconPlus size={14} color={color("blue")} />}
              <Text fz={14} c={color("blue")}>
                {item.note || t("note")}
              </Text>
            </Group>
          </Tooltip>
        </Group>

        <Group justify="space-between">
          <Group gap={8} align="center">
            <Text fw={300}>{num(item.price, { type: "money" })}</Text>

            {item.product.minPrice && (
              <ActionIcon variant="subtle" color="gray" size="xs" onClick={onChangePrice}>
                <IconPencil />
              </ActionIcon>
            )}
          </Group>

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
        </Group>
      </Stack>
    </Group>
  );
};
