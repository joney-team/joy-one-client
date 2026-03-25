"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { HoverToEdit } from "@/components/hover-to-edit";
import { Renderer } from "@/components/renderer";
import { TooltipIcon } from "@/components/tooltip-icon";
import { ReceiptStatus, ReceiptType } from "@/graphql/enums.graphql";
import { InputModalType } from "@/modals/modal-input";
import { useInspectLoanReceipt } from "@/modules/loans/hooks/use-inspect-loan-receipt";
import { ReceiptFragment } from "@/modules/receipts/graphql/fragmentReceipt.graphql";
import MUTATION_UPDATE_RECEIPT from "@/modules/receipts/graphql/mutationUpdateReceipt.graphql";
import { OnModalPartialPayment } from "@/modules/receipts/modals/modal-partial-payment";
import { ModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { type ModalReceiptDetailRef } from "@/modules/receipts/modals/modal-receipt-detail";
import { normalizeUpdateReceiptInput } from "@/modules/receipts/utils/normalize-update-receipt-input";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { String } from "@/utils/string.utils";
import { useMutation } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Badge, Card, Group, Stack, Table, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconCashRegister,
  IconCircleHalf2,
  IconFileTypePdf,
  IconInfoCircle,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, Fragment, useRef } from "react";
import { LoanFragment } from "../graphql/fragmentLoan.graphql";

const ModalReceiptDetail = dynamic(
  () =>
    import("@/modules/receipts/modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const LoanReceiptCard: FC<{
  receipt: ReceiptFragment;
  receipts: ReceiptFragment[];
  loan: LoanFragment;
}> = (props) => {
  const workspace = useWorkspace();
  const { workspaceSetting } = useWorkspaceSetting();

  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);
  const { receipt, loan, receipts } = props;
  const { isLiquidation, fee, capital, period, isExpired, data, isPartialPayment } =
    useInspectLoanReceipt(receipt, loan);

  const prevReceipts = receipts.filter(
    (v) => (v.data?.period?.period || 0) < period && v.type === ReceiptType.Income,
  );
  const isAbleToPay =
    prevReceipts.every((v) => v.status === ReceiptStatus.Paid) ||
    isExpired ||
    !!data.lateInterest ||
    !!data.liquidation;
  const isShowExplain = isPartialPayment || !!data.liquidation;
  const isAbleToUpdate = !!workspace.hasPermission(WorkspacePermission.RECEIPTS_UPDATE);

  const linkReceiptPdf = workspaceSetting?.loanSettings?.receiptPdfUrl
    ? workspaceSetting?.loanSettings.receiptPdfUrl.replace("{id}", receipt.id)
    : undefined;

  const [updateReceipt] = useMutation(MUTATION_UPDATE_RECEIPT);

  const onChangeAmount = async (amount: number) => {
    if (!isAbleToUpdate) return;
    await updateReceipt({
      variables: {
        updateReceiptId: receipt.id,
        input: { ...normalizeUpdateReceiptInput(receipt), amount, isFixedAmount: true },
      },
    });
  };

  const onUpdateNote = async (note: string) => {
    await updateReceipt({
      variables: {
        updateReceiptId: receipt.id,
        input: { ...normalizeUpdateReceiptInput(receipt), note },
      },
    });
  };

  return (
    <Card key={receipt.id} shadow="none" withBorder p={10}>
      <Stack>
        <Group justify="space-between">
          <Anchor fz={16} fw={600} onClick={() => modalReceiptDetailRef.current?.open(receipt.id)}>
            {receipt.code}
          </Anchor>

          {data?.lateInterest && (
            <Badge color="red" variant="light">
              <Trans>Late interest</Trans>
            </Badge>
          )}

          {isPartialPayment && (
            <Badge color="orange" variant="light">
              <Trans>Partial payment</Trans>
            </Badge>
          )}
        </Group>

        <Table horizontalSpacing={0}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Trans>Pay expire</Trans>
              </Table.Td>

              <Table.Td ta="right" c={isExpired ? "red" : "gray"}>
                {receipt.expireAt && <DateFormat value={receipt.expireAt} type="date" />}
              </Table.Td>
            </Table.Tr>

            {linkReceiptPdf && (
              <Table.Tr>
                <Table.Td>
                  <Trans>Receipt</Trans>
                </Table.Td>

                <Table.Td ta="right" c={isExpired ? "red" : "gray"}>
                  {linkReceiptPdf ? (
                    <Anchor fz={14} fw={500} href={linkReceiptPdf} target="_blank">
                      <Group gap={4} align="center" justify="end">
                        <IconFileTypePdf size={18} />
                        <Trans>View</Trans>
                      </Group>
                    </Anchor>
                  ) : (
                    "--"
                  )}
                </Table.Td>
              </Table.Tr>
            )}

            {isShowExplain && !data.liquidationCalculated && (
              <Fragment>
                <Table.Tr>
                  <Table.Td>
                    <Trans>Interest</Trans>
                  </Table.Td>

                  <Table.Td ta="right">
                    <CurrencyFormat value={fee} />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>
                    <Trans>Principal</Trans>
                  </Table.Td>

                  <Table.Td ta="right">
                    <CurrencyFormat value={capital} />
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            {data.liquidationCalculated && (
              <Fragment>
                <Table.Tr>
                  <Table.Td>
                    <Trans>Remain capital amount</Trans>
                  </Table.Td>
                  <Table.Td ta="right">
                    <CurrencyFormat value={data.liquidationCalculated.remainCapitalAmount} />
                  </Table.Td>
                </Table.Tr>

                <Tooltip
                  disabled={data.liquidationCalculated.period === 0}
                  label={
                    <Stack gap={5} py={3}>
                      <Table withTableBorder withColumnBorders>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td>
                              <Trans>Interest period</Trans>
                            </Table.Td>
                            <Table.Td fw={700}>
                              {data.liquidationCalculated.period} (
                              {data.liquidationCalculated.periodStartAt && (
                                <DateFormat
                                  value={data.liquidationCalculated.periodStartAt}
                                  type="date"
                                />
                              )}
                              )
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td>
                              <Trans>Interest days</Trans>
                            </Table.Td>
                            <Table.Td fw={700}>
                              <NumberFormat value={data.liquidationCalculated.periodFeeDays} />
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td>
                              <Trans>Interest per day</Trans>
                            </Table.Td>
                            <Table.Td fw={700}>
                              <NumberFormat value={data.liquidationCalculated.periodFeePerDay} />
                            </Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Stack>
                  }
                >
                  <Table.Tr>
                    <Table.Td>
                      <Trans>Period fee amount</Trans>
                    </Table.Td>

                    <Table.Td ta="right">
                      <CurrencyFormat value={data.liquidationCalculated.periodFeeAmount} />
                    </Table.Td>
                  </Table.Tr>
                </Tooltip>

                <Table.Tr>
                  <Table.Td>
                    <Trans>Remain capital amount fee</Trans> (
                    <NumberFormat
                      value={data.liquidationCalculated.remainCapitalAmountFeePercent}
                    />
                    %)
                  </Table.Td>
                  <Table.Td ta="right">
                    <CurrencyFormat value={data.liquidationCalculated.remainCapitalAmountFee} />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>
                    <Trans>Late interest fee</Trans>
                  </Table.Td>
                  <Table.Td ta="right">
                    <CurrencyFormat value={data.liquidationCalculated.lateInterestAmount} />
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            {data.lateInterest && (
              <Fragment>
                <Table.Tr>
                  <Table.Td>
                    <Trans>Late interest fee days</Trans>
                  </Table.Td>

                  <Table.Td ta="right">
                    <NumberFormat value={data.lateInterest.days} />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>
                    <Trans>Late interest fee rate</Trans>
                  </Table.Td>

                  <Table.Td ta="right">
                    <NumberFormat value={data.lateInterest.rate} />%
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            <Table.Tr>
              <Table.Td>
                <Trans>Note</Trans>
              </Table.Td>

              <Table.Td ta="right">
                <HoverToEdit
                  justify="end"
                  disabled={!isAbleToUpdate}
                  input={{
                    type: InputModalType.TEXTAREA,
                    value: receipt.data?.note || "",
                    onDone: async (v) => {
                      if (!isAbleToUpdate) return;
                      await onUpdateNote(v);
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

            <Table.Tr>
              <Table.Td>
                <Trans>Total</Trans>
              </Table.Td>

              <Table.Td ta="right" fw={600}>
                <Group gap={5} justify="end">
                  <TooltipIcon
                    icon={IconInfoCircle}
                    label={<Trans>Amount has been changed</Trans>}
                    disabled={!receipt.dataChanged?.amount}
                    color="orange"
                  />

                  <HoverToEdit
                    justify="end"
                    disabled={!isAbleToUpdate}
                    input={{
                      type: InputModalType.MONEY,
                      value: receipt.amount,
                      onDone: async (v) => {
                        if (!isAbleToUpdate) return;
                        await onChangeAmount(v);
                      },
                    }}
                  >
                    <CurrencyFormat value={receipt.amount} />
                  </HoverToEdit>
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        {(function () {
          if (receipt.status === ReceiptStatus.Pending) {
            return (
              <Stack align="center">
                {isExpired && (
                  <Badge color="red" variant="light">
                    <Trans>Expired</Trans>
                  </Badge>
                )}

                <Group justify="center">
                  <ModalPayReceipt>
                    {(modal) => (
                      <Button
                        onClick={() => modal.open({ receipt })}
                        leftIcon={IconCashRegister}
                        disabled={!isAbleToPay}
                      >
                        <Trans>Pay</Trans>
                      </Button>
                    )}
                  </ModalPayReceipt>
                </Group>

                <Renderer visible={!isLiquidation && isAbleToPay && !data.lateInterest}>
                  <Anchor
                    variant="subtle"
                    c="gray"
                    fz={16}
                    onClick={() => OnModalPartialPayment({ receipt })}
                  >
                    <Group gap={3}>
                      <ThemeIcon color="gray" size="xs" variant="transparent">
                        <IconCircleHalf2 />
                      </ThemeIcon>
                      <Trans>Partial payment</Trans>
                    </Group>
                  </Anchor>
                </Renderer>
              </Stack>
            );
          }

          if (receipt.status === ReceiptStatus.Paid) {
            return (
              <Group justify="center">
                <Badge color="green" variant="light">
                  <Trans>Paid</Trans>
                </Badge>
              </Group>
            );
          }
        })()}
      </Stack>

      <ModalReceiptDetail ref={modalReceiptDetailRef} />
    </Card>
  );
};
