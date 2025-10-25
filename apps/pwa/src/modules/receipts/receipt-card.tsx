"use client";

import {
  ReceiptEntity,
  ReceiptPaymentMethod,
  ReceiptStatus,
  ReceiptType,
  UpdateReceiptDto,
} from "@/modules/receipts/receipts-types";
import {
  Anchor,
  Badge,
  Card,
  CardProps,
  em,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { FC } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { HoverToEdit } from "@/components/hover-to-edit";
import { ModalTitle } from "@/components/modal-title";
import { NumberCurrencyFormatter } from "@/components/number-currency-formatter";
import { Renderer } from "@/components/renderer";
import { InputModalType } from "@/modals/modal-input";
import { PrintButton } from "@/modals/modal-printer";
import { FilesBox } from "@/modules/files/files-box";
import { num, renderDate, renderDateTime, tl } from "@/modules/lang/lang-service";
import { getOrderById } from "@/modules/orders/orders-service";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { OnModalDisburesementReceipt } from "@/modules/receipts/modals/modal-disburesement-receipt";
import { OnModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { OnReceiptDetailModal } from "@/modules/receipts/modals/modal-receipt-detail";
import {
  archiveReceipt,
  receiptPaymentMethodOptions,
  receiptStatusOptions,
  receiptTypeColors,
  receiptTypeIcons,
} from "@/modules/receipts/receipts-service";
import { useColor } from "@/modules/theme/use-color";
import { UserCard } from "@/modules/users/components/user-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { modals } from "@mantine/modals";
import { IconArchive, IconCashRegister, IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";

interface ReceiptCardProps {
  receipt: ReceiptEntity;
  hideCustomer?: boolean;
  hideRelatedUsers?: boolean;
  cardProps?: CardProps;
  onUpdate?: (dto: UpdateReceiptDto) => Promise<void>;
  isShowPrint?: boolean;
  isShowImage?: boolean;
  isOpenModal?: boolean;
}

export const ReceiptCard: FC<ReceiptCardProps> = ({ isOpenModal = true, ...props }) => {
  const { receipt } = props;
  const workspace = useWorkspace();

  const color = useColor();

  const banks = useBanks();
  const bank = banks.find((v) => workspace.settings.bankAccount?.bankId === v.id);
  const bankAccount = workspace.settings.bankAccount;
  const totalAmount = receipt.amount + (receipt.tipAmount || 0);
  const isExpired = receipt.expireAt && receipt.expireAt < DateTime.timeToSeconds();

  const isAbleToPrint =
    !!receipt.relatedOrderId && receipt.type === ReceiptType.INCOME && !receipt.isArchived;

  const isAbleToUpdate =
    props.onUpdate && workspace.hasPermission(WorkspacePermission.RECEIPTS_UPDATE);

  const bankQrCode =
    bank && bankAccount && receipt
      ? getStaticQrCode(bank, bankAccount, {
          amount: totalAmount,
          description: renderEntityCode(receipt.code),
        })
      : undefined;

  const receiptTypeColor = color(receiptTypeColors[receipt.type]);
  const ReceiptTypeIcon = receiptTypeIcons[receipt.type];

  const relatedOrder = useFetch({
    id: `order-order-${receipt.relatedOrderId}`,
    skip: !receipt.relatedOrderId,
    fetch: async () => {
      if (!receipt.relatedOrderId) return null;
      return getOrderById(receipt.relatedOrderId);
    },
  });

  return (
    <Card withBorder shadow="none" {...props.cardProps}>
      <Stack h="100%" flex={1}>
        <Stack gap={8} flex={1}>
          <Group justify="space-between" align="center">
            <Group
              flex={1}
              gap={8}
              className={isOpenModal ? "clickable" : undefined}
              onClick={() => isOpenModal && OnReceiptDetailModal({ id: receipt.id })}
            >
              <Tooltip
                label={tl(
                  receipt.type === ReceiptType.INCOME ? "income_receipt" : "expense_receipt"
                )}
              >
                <ThemeIcon size="lg" variant="light" color={receiptTypeColor} radius={100}>
                  <ReceiptTypeIcon size={20} />
                </ThemeIcon>
              </Tooltip>

              <Stack gap={0}>
                <Text c={receiptTypeColor} fw={700} fz={em(13)}>
                  {renderEntityCode(receipt.code)}
                </Text>

                <Group gap={5}>
                  <Text fz={em(10)} c="dark">
                    {renderDateTime(receipt.createdAt, true)}
                  </Text>

                  <Text fz={em(8)} c="gray">
                    {dayjs(receipt.createdAt * 1000).fromNow()}
                  </Text>
                </Group>
              </Stack>
            </Group>

            <Group gap={10}>
              {!props.hideCustomer && props.receipt.relatedCustomer && (
                <Anchor
                  td="none"
                  fw={500}
                  fz={em(16)}
                  component={Link}
                  href={`/customers/${receipt.relatedCustomer!.code}`}
                >
                  <Group justify="start" wrap="nowrap">
                    <Card p={2} withBorder shadow="none" radius={150}>
                      <Group gap={5} wrap="nowrap">
                        <Avatar customer={receipt.relatedCustomer} size={32} radius="xl" />

                        <Stack gap={3} pr={10} align="left">
                          <Text ta="left" fz={10} fw={600}>
                            {receipt.relatedCustomer!.name}
                          </Text>
                          <Text ta="left" fz={8} fw={500} mt={-2}>
                            {renderEntityCode(
                              receipt.relatedCustomer?.code,
                              receipt.relatedCustomer?.plainCode
                            )}
                          </Text>
                        </Stack>
                      </Group>
                    </Card>
                  </Group>
                </Anchor>
              )}
            </Group>
          </Group>

          <Table horizontalSpacing={0} verticalSpacing={10}>
            <Table.Tbody>
              {receipt.relatedLoanCode && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("loan")}
                  </Table.Th>
                  <Table.Td ta="right">
                    <Group h={20} justify="end">
                      <Anchor
                        component={Link}
                        href={`/loans/${receipt.relatedLoanCode}`}
                        fz={em(15)}
                        fw={600}
                        onClick={() => modals.closeAll()}
                      >
                        {renderEntityCode(receipt.relatedLoanCode)}
                      </Anchor>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              {receipt.relatedOrderId && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("order")}
                  </Table.Th>
                  <Table.Td ta="right">
                    <Group h={20} justify="end">
                      {relatedOrder.data ? (
                        <Anchor
                          component={Link}
                          href={`/orders/${relatedOrder.data.code}`}
                          fz={em(15)}
                          fw={600}
                          onClick={() => modals.closeAll()}
                        >
                          {renderEntityCode(relatedOrder.data.code)}
                        </Anchor>
                      ) : (
                        <Skeleton h={20} w={80} />
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              <Renderer visible={!!receipt.expireAt && receipt.status === ReceiptStatus.PENDING}>
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("due_date")}
                  </Table.Th>
                  <Table.Td ta="right" c={isExpired ? "red" : undefined}>
                    {renderDate(receipt.expireAt)}
                  </Table.Td>
                </Table.Tr>
              </Renderer>

              <Table.Tr>
                <Table.Th fz={13} fw={500} ta="left">
                  {tl("content")}
                </Table.Th>
                <Table.Td fw={700}>
                  <HoverToEdit
                    justify="end"
                    disabled={!isAbleToUpdate}
                    input={{
                      type: InputModalType.TEXTAREA,
                      value: receipt.note,
                      onDone: (v) => {
                        if (!isAbleToUpdate || !props.onUpdate) return;
                        props.onUpdate({ ...receipt, note: v });
                      },
                    }}
                  >
                    <Text
                      ta="right"
                      dangerouslySetInnerHTML={{
                        __html: String.replaceLineBreaksToHTML(receipt.note || "--"),
                      }}
                    />
                  </HoverToEdit>
                </Table.Td>
              </Table.Tr>

              {props.isShowImage && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("receipt")}
                  </Table.Th>
                  <Table.Td fw={700} ta="end">
                    <Group justify="end">
                      <FilesBox
                        disabled
                        query={{
                          relatedReceiptId: receipt.id,
                          entity: AppEntity.RECEIPTS,
                          entityId: receipt.id,
                        }}
                        empty={<Text fz={em(12)}>{tl("no_files")}</Text>}
                      />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              {!!receipt.tipAmount && receipt.tipAmount > 0 && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    Tip
                  </Table.Th>
                  <Table.Td fw={700} ta="right">
                    {num(receipt.tipAmount, { type: "money" })}
                  </Table.Td>
                </Table.Tr>
              )}

              {!!receipt.cashierUser && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("cashier")}
                  </Table.Th>
                  <Table.Td fw={700}>
                    <Group justify="end">
                      <UserCard user={receipt.cashierUser} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              {!!receipt.paidAt && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("paid_at")}
                  </Table.Th>
                  <Table.Td fw={700} ta="right">
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.DATE_TIME,
                        value: receipt.paidAt,
                        onDone: (v) => {
                          if (!isAbleToUpdate || !props.onUpdate) return;
                          props.onUpdate({ ...receipt, paidAt: v });
                        },
                      }}
                    >
                      <Text ta="right">{renderDateTime(receipt.paidAt)}</Text>
                    </HoverToEdit>
                  </Table.Td>
                </Table.Tr>
              )}

              <Renderer visible={receipt.status === ReceiptStatus.PAID}>
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("payment_method")}
                  </Table.Th>
                  <Table.Td>
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.SELECT,
                        title: "payment_method",
                        value: receipt.paymentMethod,
                        options: Object.values(ReceiptPaymentMethod).map((v) => ({
                          label: tl(`payment_method_${v}`),
                          value: v,
                        })),
                        onDone: (v) => {
                          if (!isAbleToUpdate || !props.onUpdate) return;
                          props.onUpdate({ ...receipt, paymentMethod: v as ReceiptPaymentMethod });
                        },
                      }}
                    >
                      {(function () {
                        const paymentMethodOption = receipt.paymentMethod
                          ? receiptPaymentMethodOptions[receipt.paymentMethod]
                          : undefined;

                        if (!paymentMethodOption) return <Text>{tl("unknown")}</Text>;

                        return (
                          <Group gap={5}>
                            <paymentMethodOption.icon
                              color={paymentMethodOption.color}
                              size={25}
                              strokeWidth={1.5}
                            />
                            <Text>{tl(`payment_method_${receipt.paymentMethod}`)}</Text>
                          </Group>
                        );
                      })()}
                    </HoverToEdit>
                  </Table.Td>
                </Table.Tr>
              </Renderer>

              {!!receipt.disbursementUser && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {tl("user_disbursement")}
                  </Table.Th>
                  <Table.Td fw={700}>
                    <Group justify="end">
                      <UserCard user={receipt.disbursementUser} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              <Table.Tr>
                <Table.Th fz={13} fw={500} ta="left">
                  {tl("money_amount")}
                </Table.Th>
                <Table.Td ta="right" c={receipt.amount < 0 ? "red" : "dark"}>
                  <Stack gap={8}>
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.MONEY,
                        title: "money_amount",
                        value: receipt.amount,
                        icon: IconCashRegister,
                        onDone: (amount) => {
                          if (!amount) return;
                          props.onUpdate?.({ ...receipt, amount });
                        },
                      }}
                    >
                      <Text fz={18} fw={700}>
                        <NumberCurrencyFormatter value={receipt.amount} />
                      </Text>
                    </HoverToEdit>

                    <Stack justify="end" align="end" mt={5} gap={8}>
                      {(function () {
                        if (receipt.type === ReceiptType.EXPENSE) {
                          return receipt.status === ReceiptStatus.PAID ? (
                            <Badge color="green" size="sm">
                              Đã duyệt chi
                            </Badge>
                          ) : (
                            <Stack align="end">
                              {workspace.hasPermission(WorkspacePermission.RECEIPTS_CENSORSHIP) ? (
                                <Group gap={8}>
                                  <Button
                                    leftSection={<IconCheck size={18} />}
                                    radius={100}
                                    size="xs"
                                    onClick={() => OnModalDisburesementReceipt({ receipt })}
                                  >
                                    Duyệt chi
                                  </Button>

                                  <Button
                                    leftSection={<IconCheck size={18} />}
                                    radius={100}
                                    color="gray"
                                    size="xs"
                                    onClick={() => {
                                      modals.openConfirmModal({
                                        id: "ConfirmArchiveReceipt",
                                        title: (
                                          <ModalTitle
                                            color="red"
                                            title="Từ chối chi"
                                            icon={IconArchive}
                                          />
                                        ),
                                        children:
                                          "Bạn có chắc chắn muốn từ chối chi? Hành động này không thể hoàn tác. Hoá đơn sẽ bị xoá.",
                                        color: "red",
                                        onConfirm: async () => {
                                          return archiveReceipt(receipt.id).catch(onError);
                                        },
                                        labels: { confirm: "Từ chối chi", cancel: "Hủy" },
                                        onCancel: () => modals.close("ConfirmArchiveReceipt"),
                                        confirmProps: { color: "red" },
                                      });
                                    }}
                                    variant="outline"
                                  >
                                    {tl("reject")}
                                  </Button>
                                </Group>
                              ) : (
                                <Badge color="red" size="sm">
                                  Chưa duyệt chi
                                </Badge>
                              )}
                            </Stack>
                          );
                        }

                        return (
                          <Badge
                            color={receiptStatusOptions[receipt.status].color}
                            size="sm"
                            variant="outline"
                          >
                            {tl(`receipt_status_${receipt.status}`)}
                          </Badge>
                        );
                      })()}
                    </Stack>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>

        {!receipt.isArchived && (
          <Group justify="end">
            <Renderer visible={isAbleToPrint}>
              <PrintButton receipt={receipt} bankQrCode={bankQrCode} label={tl("print_receipt")} />
            </Renderer>

            {receipt.status !== ReceiptStatus.PAID && (
              <Button
                size="xs"
                leftIcon={IconCashRegister}
                onClick={() => OnModalPayReceipt({ receipt: receipt })}
              >
                {tl("pay")}
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
};
