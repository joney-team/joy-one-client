"use client";

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

import { ReceiptPaymentMethod, ReceiptStatus, ReceiptType } from "@/graphql/enums.graphql";
import { UpdateReceiptInput } from "@/graphql/types.graphql";
import { UserCard } from "@/modules/users/components/user-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { String } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import { ReceiptFragment } from "./graphql/fragmentReceipt.graphql";
import { type ModalReceiptDetailRef } from "./modals/modal-receipt-detail";
import { receiptPaymentMethods, receiptStatuses, receiptTypes } from "./receipt-constants";
import { useMutation } from "@apollo/client/react";
import MUTATION_ARCHIVE_RECEIPT from "./graphql/mutationArchiveReceipt.graphql";
import { normalizeUpdateReceiptInput } from "./utils/normalize-update-receipt-input";

const ModalPayReceipt = dynamic(
  () => import("./modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalReceiptDetail = dynamic(
  () => import("./modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface ReceiptCardProps {
  receipt: ReceiptFragment;
  hideCustomer?: boolean;
  hideRelatedUsers?: boolean;
  cardProps?: CardProps;
  onUpdate?: (dto: UpdateReceiptInput) => Promise<void>;
  isShowPrint?: boolean;
  isShowImage?: boolean;
  isOpenModal?: boolean;
}

export const ReceiptCard: FC<ReceiptCardProps> = ({ isOpenModal = true, ...props }) => {
  const { receipt } = props;
  const { t } = useLingui();
  const workspace = useWorkspace();
  const { workspaceSetting } = useWorkspaceSetting();

  const [archiveReceipt] = useMutation(MUTATION_ARCHIVE_RECEIPT);

  const banks = useBanks();
  const bank = banks.find((v) => workspaceSetting?.bankAccount?.bankId === v.id);
  const bankAccount = workspaceSetting?.bankAccount;
  const totalAmount = receipt.amount + (receipt.tipAmount || 0);
  const isExpired = receipt.expireAt && receipt.expireAt < DateTime.toSeconds(new Date());
  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);

  const isAbleToPrint =
    !!receipt.relatedOrderId && receipt.type === ReceiptType.Income && !receipt.isArchived;

  const isAbleToUpdate =
    props.onUpdate && workspace.hasPermission(WorkspacePermission.RECEIPTS_UPDATE);

  const bankQrCode =
    bank && bankAccount && receipt
      ? getStaticQrCode(bank, bankAccount, {
          amount: totalAmount,
          description: renderEntityCode(receipt.code),
        })
      : undefined;

  const ReceiptTypeIcon = receiptTypes[receipt.type].icon;

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
      onConfirm: () => archiveReceipt({ variables: { archiveReceiptId: receipt.id } }),
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
              <Tooltip label={t(receiptTypes[receipt.type].label)}>
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

                {receipt.createdAt && (
                  <Group gap={5}>
                    <Text fz={em(10)} c="dark">
                      <DateFormat value={receipt.createdAt} type="date" />
                    </Text>

                    <Text fz={em(8)} c="gray">
                      <RelativeTimeFormat value={receipt.createdAt} />
                    </Text>
                  </Group>
                )}
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
                              receipt.relatedCustomer?.plainCode,
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
                    <Trans>Loan</Trans>
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
                    <Trans>Order</Trans>
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

              <Renderer visible={!!receipt.expireAt && receipt.status === ReceiptStatus.Pending}>
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    <Trans>Due date</Trans>
                  </Table.Th>
                  <Table.Td ta="right" c={isExpired ? "red" : undefined}>
                    {receipt.expireAt && <DateFormat value={receipt.expireAt} type="date-time" />}
                  </Table.Td>
                </Table.Tr>
              </Renderer>

              <Table.Tr>
                <Table.Th fz={13} fw={500} ta="left">
                  <Trans>Content</Trans>
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
                        props.onUpdate({ ...normalizeUpdateReceiptInput(receipt), note: v });
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
                    <Trans>Receipt</Trans>
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
                    <Trans>Cashier</Trans>
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
                    <Trans>Paid at</Trans>
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
                          props.onUpdate({ ...normalizeUpdateReceiptInput(receipt), paidAt: v });
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

              <Renderer visible={receipt.status === ReceiptStatus.Paid}>
                <Table.Tr>
                  <Table.Th fz={13} fw={500} ta="left">
                    <Trans>Payment method</Trans>
                  </Table.Th>
                  <Table.Td>
                    <HoverToEdit
                      justify="end"
                      disabled={!isAbleToUpdate}
                      input={{
                        type: InputModalType.SELECT,
                        title: <Trans>Payment method</Trans>,
                        value: receipt.paymentMethod,
                        options: Object.values(ReceiptPaymentMethod).map((v) => ({
                          label: t(receiptPaymentMethods[v].label),
                          value: v,
                        })),
                        onDone: (v: ReceiptPaymentMethod) => {
                          if (!isAbleToUpdate || !props.onUpdate) return;
                          props.onUpdate({
                            ...normalizeUpdateReceiptInput(receipt),
                            paymentMethod: v,
                          });
                        },
                      }}
                    >
                      {(function () {
                        const paymentMethodOption = receipt.paymentMethod
                          ? receiptPaymentMethods[receipt.paymentMethod]
                          : undefined;

                        if (!paymentMethodOption)
                          return (
                            <Text>
                              <Trans>Unknown</Trans>
                            </Text>
                          );

                        return (
                          <Group gap={5}>
                            <paymentMethodOption.icon
                              color={paymentMethodOption.color}
                              size={25}
                              strokeWidth={1.5}
                            />
                            <Text>{t(paymentMethodOption.label)}</Text>
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
                    <Trans>User disbursement</Trans>
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
                          props.onUpdate?.({ ...normalizeUpdateReceiptInput(receipt), amount });
                        },
                      }}
                    >
                      <Text fz={18} fw={700}>
                        <CurrencyFormat value={receipt.amount} />
                      </Text>
                    </HoverToEdit>

                    <Stack justify="end" align="end" mt={5} gap={8}>
                      {(function () {
                        if (receipt.type === ReceiptType.Expense) {
                          return receipt.status === ReceiptStatus.Paid ? (
                            <Badge color="green" size="sm">
                              <Trans>Approved</Trans>
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
                                    <Trans>Approve Expense</Trans>
                                  </Button>

                                  <Button
                                    leftSection={<IconCheck size={18} />}
                                    radius={100}
                                    color="gray"
                                    size="xs"
                                    onClick={onRejectExpense}
                                    variant="outline"
                                  >
                                    <Trans>Reject</Trans>
                                  </Button>
                                </Group>
                              ) : (
                                <Badge color="red" size="sm">
                                  <Trans>Not Approved</Trans>
                                </Badge>
                              )}
                            </Stack>
                          );
                        }

                        return (
                          <Badge
                            color={receiptStatuses[receipt.status].color}
                            size="sm"
                            variant="outline"
                          >
                            {t(receiptStatuses[receipt.status].label)}
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

            {receipt.status !== ReceiptStatus.Paid && (
              <ModalPayReceipt>
                {(modal) => (
                  <Button
                    size="xs"
                    leftIcon={IconCashRegister}
                    onClick={() => modal.open({ receipt: receipt })}
                  >
                    <Trans>Pay</Trans>
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
