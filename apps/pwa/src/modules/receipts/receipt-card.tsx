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
import { FC, useRef } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { HoverToEdit } from "@/components/hover-to-edit";
import { Renderer } from "@/components/renderer";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { InputModalType } from "@/modals/modal-input";
import { PrintButton } from "@/modals/modal-printer";
import { FilesBox } from "@/modules/files/files-box";
import { getOrderById } from "@/modules/orders/orders-service";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { OnModalDisburesementReceipt } from "@/modules/receipts/modals/modal-disburesement-receipt";

import {
  archiveReceipt,
  receiptStatusOptions,
  receiptTypeIcons,
} from "@/modules/receipts/receipts-service";
import { UserCard } from "@/modules/users/components/user-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { String } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { type ModalReceiptDetailRef } from "./modals/modal-receipt-detail";
import { receiptPaymentMethods, receiptStatuses, receiptTypes } from "./receipt-constants";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";

const ModalPayReceipt = dynamic(
  () => import("./modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalReceiptDetail = dynamic(
  () => import("./modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  }
);

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
  const { workspaceSetting } = useWorkspaceSetting();

  const banks = useBanks();
  const bank = banks.find((v) => workspaceSetting?.bankAccount?.bankId === v.id);
  const bankAccount = workspaceSetting?.bankAccount;
  const totalAmount = receipt.amount + (receipt.tipAmount || 0);
  const isExpired = receipt.expireAt && receipt.expireAt < DateTime.toSeconds(new Date());
  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);

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

  const ReceiptTypeIcon = receiptTypeIcons[receipt.type];

  const relatedOrder = useFetch({
    id: `order-order-${receipt.relatedOrderId}`,
    skip: !receipt.relatedOrderId,
    fetch: async () => {
      if (!receipt.relatedOrderId) return null;
      return getOrderById(receipt.relatedOrderId);
    },
  });

  const onRejectExpense = () => {
    onConfirmModal({
      title: <Trans>Reject Expense</Trans>,
      content: (
        <Trans>
          Are you sure you want to reject the expense? This action cannot be undone. The receipt
          will be deleted.
        </Trans>
      ),
      type: "danger",
      onConfirm: () => archiveReceipt(receipt.id),
      confirmLabel: <Trans>Reject Expense</Trans>,
    });
  };

  return (
    <Card withBorder shadow="none" {...props.cardProps}>
      <Stack h="100%" flex={1}>
        <Stack gap={8} flex={1}>
          <Group justify="space-between" align="center">
            <Group
              flex={1}
              gap={8}
              className={isOpenModal ? "clickable" : undefined}
              onClick={() => isOpenModal && modalReceiptDetailRef.current?.open(receipt.id)}
            >
              <Tooltip label={receiptTypes[receipt.type].label()}>
                <ThemeIcon
                  size="lg"
                  variant="light"
                  color={receiptTypes[receipt.type].color}
                  radius={100}
                >
                  <ReceiptTypeIcon size={20} />
                </ThemeIcon>
              </Tooltip>

              <Stack gap={0}>
                <Text c={receiptTypes[receipt.type].color} fw={700} fz={em(13)}>
                  {renderEntityCode(receipt.code)}
                </Text>

                <Group gap={5}>
                  <Text fz={em(10)} c="dark">
                    <DateFormat value={receipt.createdAt} type="date" />
                  </Text>

                  <Text fz={em(8)} c="gray">
                    <RelativeTimeFormat value={receipt.createdAt} />
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
                    {t`Loan`}
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
                    {t`Order`}
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
                    {t`Due date`}
                  </Table.Th>
                  <Table.Td ta="right" c={isExpired ? "red" : undefined}>
                    {receipt.expireAt && <DateFormat value={receipt.expireAt} type="date-time" />}
                  </Table.Td>
                </Table.Tr>
              </Renderer>

              <Table.Tr>
                <Table.Th fz={13} fw={500} ta="left">
                  {t`Content`}
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
                    {t`Receipt`}
                  </Table.Th>
                  <Table.Td fw={700} ta="end">
                    <Group justify="end">
                      <FilesBox
                        disabled
                        refs={[`${AppEntity.RECEIPTS}:${receipt.id}`]}
                        empty={<Text fz={em(12)}>{t`No files`}</Text>}
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
                    <CurrencyFormat value={receipt.tipAmount} />
                  </Table.Td>
                </Table.Tr>
              )}

              {!!receipt.cashierUser && (
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {t`Cashier`}
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
                    {t`Paid at`}
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
                      <Text ta="right">
                        <DateFormat value={receipt.paidAt} type="date-time" />
                      </Text>
                    </HoverToEdit>
                  </Table.Td>
                </Table.Tr>
              )}

              <Renderer visible={receipt.status === ReceiptStatus.PAID}>
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    {t`Payment method`}
                  </Table.Th>
                  <Table.Td>
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.SELECT,
                        title: t`Payment method`,
                        value: receipt.paymentMethod,
                        options: Object.values(ReceiptPaymentMethod).map((v) => ({
                          label: receiptPaymentMethods[v].label(),
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
                          ? receiptPaymentMethods[receipt.paymentMethod]
                          : undefined;

                        if (!paymentMethodOption) return <Text>{t`Unknown`}</Text>;

                        return (
                          <Group gap={5}>
                            <paymentMethodOption.icon
                              color={paymentMethodOption.color}
                              size={25}
                              strokeWidth={1.5}
                            />
                            <Text>{paymentMethodOption.label()}</Text>
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
                    {t`User disbursement`}
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
                  <Trans>Money amount</Trans>
                </Table.Th>
                <Table.Td ta="right" c={receipt.amount < 0 ? "red" : "dark"}>
                  <Stack gap={8}>
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.MONEY,
                        title: t`Money amount`,
                        value: receipt.amount,
                        icon: IconCashRegister,
                        onDone: (amount) => {
                          if (!amount) return;
                          props.onUpdate?.({ ...receipt, amount });
                        },
                      }}
                    >
                      <Text fz={18} fw={700}>
                        <CurrencyFormat value={receipt.amount} />
                      </Text>
                    </HoverToEdit>

                    <Stack justify="end" align="end" mt={5} gap={8}>
                      {(function () {
                        if (receipt.type === ReceiptType.EXPENSE) {
                          return receipt.status === ReceiptStatus.PAID ? (
                            <Badge color="green" size="sm">
                              {t`Approved`}
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
                                    {t`Approve Expense`}
                                  </Button>

                                  <Button
                                    leftSection={<IconCheck size={18} />}
                                    radius={100}
                                    color="gray"
                                    size="xs"
                                    onClick={onRejectExpense}
                                    variant="outline"
                                  >
                                    {t`Reject`}
                                  </Button>
                                </Group>
                              ) : (
                                <Badge color="red" size="sm">
                                  {t`Not Approved`}
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
                            {receiptStatuses[receipt.status].label()}
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
              <PrintButton receipt={receipt} bankQrCode={bankQrCode} label={t`Print Receipt`} />
            </Renderer>

            {receipt.status !== ReceiptStatus.PAID && (
              <ModalPayReceipt>
                {(modal) => (
                  <Button
                    size="xs"
                    leftIcon={IconCashRegister}
                    onClick={() => modal.open({ receipt: receipt })}
                  >
                    {t`Pay`}
                  </Button>
                )}
              </ModalPayReceipt>
            )}
          </Group>
        )}
      </Stack>

      <ModalReceiptDetail ref={modalReceiptDetailRef} />
    </Card>
  );
};
