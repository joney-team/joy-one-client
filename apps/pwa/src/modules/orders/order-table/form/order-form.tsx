"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { Renderer } from "@/components/renderer";
import { useAuth } from "@/modules/auth/auth-context";
import { CustomerSelector } from "@/modules/customers/customer-selector";
import { num, t } from "@/modules/lang/lang-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { useColor } from "@/modules/theme/use-color";
import { UserRole } from "@/modules/users/users-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  ActionIcon,
  Card,
  Divider,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconChevronDown,
  IconClipboardText,
  IconPencil,
  IconReceipt,
  IconUserSquareRounded,
  IconX,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { OrderTableProps } from "..";
import { useOrderTable } from "../order-table-context";
import { OrderFormCombosVouchers } from "./order-form-combos-vouchers";
import { OrderFormCoupons } from "./order-form-coupons";
import { OrderFormDiscounts } from "./order-form-discount";
import { OrderFormItem } from "./order-form-item";
import { OrderFormTip } from "./order-form-tip";

export const OrderForm: FC<OrderTableProps> = (props) => {
  const color = useColor();
  const workspace = useWorkspace();
  const mod = workspace.getModule("orders");

  const auth = useAuth();
  const orderTable = useOrderTable();
  const isAbleToSave = orderTable.isDirty || auth.user.role === UserRole.SYS_ADMIN;

  return (
    <Stack h={props.size.h} p={16}>
      <Card shadow="xs" flex={1} w={500} maw="100%" p={0}>
        <Stack gap={0} h="100%">
          {orderTable.order && (
            <Group
              bg={color("primary")}
              pl={16}
              pr={16 * 0.5}
              py={16 * 0.5}
              justify="space-between"
            >
              <Text fw={700} fz={14} flex={1} c="white" ta="left">
                #{orderTable.order.code}
              </Text>

              <Group gap={3}>
                <ActionIcon variant="subtle" color="white" onClick={orderTable.archive}>
                  <IconArchive size={18} strokeWidth={1.5} />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  color="white"
                  onClick={() => {
                    orderTable.reset();
                    props.onCloseOrder?.();
                  }}
                >
                  <IconX size={18} strokeWidth={1.5} />
                </ActionIcon>
              </Group>
            </Group>
          )}

          <Group
            align="center"
            px={16}
            py={16 * 0.5}
            justify="space-between"
            style={{
              boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <CustomerSelector
              onSelect={(value) => orderTable.setCustomer(value)}
              target={(ctx) => {
                return (
                  <Group onClick={ctx.toggle} gap={10} style={{ cursor: "pointer" }}>
                    <Avatar
                      icon={IconUserSquareRounded}
                      customer={orderTable.values.relatedCustomer}
                      size={30}
                    />

                    <Stack gap={0}>
                      <Text fz={14}>
                        {orderTable.values.relatedCustomer?.name
                          ? orderTable.values.relatedCustomer?.name
                          : t("customer")}
                      </Text>
                      <Text fz={10} c="gray">
                        {t(orderTable.values.relatedCustomer ? "customer" : "add_info")}
                      </Text>
                    </Stack>

                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (orderTable.values.relatedCustomer) {
                          orderTable.setCustomer(undefined);
                        } else {
                          ctx.toggle();
                        }
                      }}
                    >
                      {orderTable.values.relatedCustomer ? <IconX /> : <IconChevronDown />}
                    </ActionIcon>
                  </Group>
                );
              }}
            />

            <Tooltip label={t("assignee")}>
              <Group>
                <WorkspaceMemberInput
                  value={orderTable.values.assigneeUsers[0]}
                  onChange={(value) =>
                    orderTable.setValues({
                      ...orderTable.values,
                      assigneeUsers: value ? [value] : [],
                    })
                  }
                  clearable
                />
              </Group>
            </Tooltip>
          </Group>

          {orderTable.values.items.length === 0 ? (
            <Stack flex={1} justify="center" align="center">
              <Empty message="add_product_to_order" hideBorder />
            </Stack>
          ) : (
            <ScrollArea flex={1} offsetScrollbars scrollbarSize={8}>
              <Stack p={16}>
                {orderTable.values.items.map((item, index) => (
                  <Fragment key={item.product._id}>
                    <OrderFormItem item={item} index={index} />
                    {index !== orderTable.values.items.length - 1 && <Divider variant="dashed" />}
                  </Fragment>
                ))}
              </Stack>
            </ScrollArea>
          )}

          <Stack
            style={{
              position: "relative",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
            p={16}
            gap={16}
          >
            <Group justify="space-between">
              <Text>{t("subtotal")}</Text>
              {orderTable.isCalculating ? (
                <Skeleton h={20} w={80} visible={orderTable.isCalculating} />
              ) : (
                <Text>{num(orderTable.subTotalAmount, { type: "money" })}</Text>
              )}
            </Group>

            <Divider variant="dashed" />

            <OrderFormDiscounts />
            <OrderFormTip />

            {orderTable.order &&
              orderTable.order.paymentStatus === OrderPaymentStatus.PROCESSING &&
              orderTable.order.paidAmount > 0 && (
                <Fragment>
                  <Divider variant="dashed" />
                  <Group justify="space-between">
                    <Text>{t("paid")}</Text>
                    <Text>{num(orderTable.order.paidAmount, { type: "money" })}</Text>
                  </Group>
                </Fragment>
              )}

            <Divider variant="dashed" />

            <Group justify="space-between">
              <Text tt="uppercase" fw={700}>
                {t("total")}
              </Text>
              {orderTable.isCalculating ? (
                <Skeleton h={20} w={80} visible={orderTable.isCalculating} />
              ) : (
                <Text fw={700}>
                  {num((orderTable.totalAmount || 0) + orderTable.tipAmount, { type: "money" })}
                </Text>
              )}
            </Group>

            <Group>
              <OrderFormCombosVouchers />
              <OrderFormCoupons />
            </Group>
          </Stack>

          {orderTable.order ? (
            <Group gap={0}>
              <Button
                h={50}
                flex={1}
                tt="capitalize"
                leftIcon={IconReceipt}
                style={{
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                onClick={orderTable.pay}
              >
                {t("pay")}
              </Button>

              <Renderer visible={!orderTable.isPaying && isAbleToSave}>
                <Group
                  h={50}
                  px={10}
                  style={{
                    borderTop: `1px solid ${color("gray.3")}`,
                  }}
                  gap={8}
                  align="center"
                >
                  <Button
                    color="gray"
                    px={16}
                    tt="capitalize"
                    variant="subtle"
                    leftIcon={IconPencil}
                    onClick={orderTable.submit}
                    loading={orderTable.isSubmitting}
                  >
                    {t("save")}
                  </Button>
                </Group>
              </Renderer>
            </Group>
          ) : (
            <Button
              h={50}
              tt="capitalize"
              leftIcon={IconClipboardText}
              style={{
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }}
              onClick={orderTable.submit}
              loading={orderTable.isSubmitting}
            >
              {t("save_entity", { entity: mod.name })}
            </Button>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};
