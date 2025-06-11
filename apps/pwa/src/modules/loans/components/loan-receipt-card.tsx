"use client";

import { NumberCurrencyFormatter } from "@/components/number-currency-formatter";
import { Button } from "@/components/buttons/button";
import { HoverToEdit } from "@/components/hover-to-edit";
import { Renderer } from "@/components/renderer";
import { TooltipIcon } from "@/components/tooltip-icon";
import { InputModalType } from "@/modals/modal-input";
import { OnModalPartialPayment } from "@/modules/receipts/modals/modal-partial-payment";
import { OnModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { OnReceiptDetailModal } from "@/modules/receipts/modals/modal-receipt-detail";
import { num, renderDate, t } from "@/modules/lang/lang-service";
import { useInspectLoanReceipt } from "@/modules/loans/hooks/use-inspect-loan-receipt";
import { LoanEntity } from "@/modules/loans/loans-types";
import { updateReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptStatus, ReceiptType } from "@/modules/receipts/receipts-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StringUtils } from "@/utils/string.utils";
import { Anchor, Badge, Card, Group, Stack, Table, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconCashRegister,
  IconCircleHalf2,
  IconFileTypePdf,
  IconInfoCircle,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";

export const LoanReceiptCard: FC<{
  receipt: ReceiptEntity;
  receipts: ReceiptEntity[];
  loan: LoanEntity;
  refetch: () => Promise<any>;
}> = (props) => {
  const workspace = useWorkspace();
  const { receipt, loan, receipts } = props;
  const { isLiquidation, fee, capital, period, isExpired, data, isPartialPayment } =
    useInspectLoanReceipt(receipt, loan);

  const prevReceipts = receipts.filter(
    (v) => (v.data?.period?.period || 0) < period && v.type === ReceiptType.INCOME
  );
  const isAbleToPay =
    prevReceipts.every((v) => v.status === ReceiptStatus.PAID) ||
    isExpired ||
    !!data.lateInterest ||
    !!data.liquidation;
  const isShowExplain = isPartialPayment || !!data.liquidation;
  const isAbleToUpdate = !!workspace.hasPermission(WorkspacePermission.RECEIPTS_UPDATE);

  const linkReceiptPdf = workspace.settings.loanSettings?.receiptPdfUrl
    ? workspace.settings.loanSettings.receiptPdfUrl.replace("{id}", receipt.id)
    : undefined;

  const onChangeAmount = async (amount: number) => {
    if (!isAbleToUpdate) return;
    await updateReceipt(receipt.id, { ...receipt, amount });
  };

  const onUpdateNote = async (note: string) => {
    await updateReceipt(receipt.id, { ...receipt, note });
  };

  return (
    <Card key={receipt.id} shadow="none" withBorder p={10}>
      <Stack>
        <Group justify="space-between">
          <Anchor fz={16} fw={600} onClick={() => OnReceiptDetailModal({ id: receipt.id })}>
            {receipt.code}
          </Anchor>

          {data?.lateInterest && (
            <Badge color="red" variant="light">
              {t("loan_late_interest_receipt")}
            </Badge>
          )}

          {isPartialPayment && (
            <Badge color="orange" variant="light">
              Chia hoá đơn
            </Badge>
          )}
        </Group>

        <Table horizontalSpacing={0}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>{t("pay_expire")}</Table.Td>

              <Table.Td ta="right" c={isExpired ? "red" : "gray"}>
                {renderDate(receipt.expireAt)}
              </Table.Td>
            </Table.Tr>

            {linkReceiptPdf && (
              <Table.Tr>
                <Table.Td>File hoá đơn</Table.Td>

                <Table.Td ta="right" c={isExpired ? "red" : "gray"}>
                  {linkReceiptPdf ? (
                    <Anchor fz={14} fw={500} href={linkReceiptPdf} target="_blank">
                      <Group gap={4} align="center" justify="end">
                        <IconFileTypePdf size={18} />
                        {t("view")}
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
                  <Table.Td>Thu lãi</Table.Td>

                  <Table.Td ta="right">
                    <NumberCurrencyFormatter value={fee} />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>Thu gốc</Table.Td>

                  <Table.Td ta="right">
                    <NumberCurrencyFormatter value={capital} />
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            {data.liquidationCalculated && (
              <Fragment>
                <Table.Tr>
                  <Table.Td>{t("remainCapitalAmount")}</Table.Td>
                  <Table.Td ta="right">
                    {num(data.liquidationCalculated.remainCapitalAmount, { type: "money" })}
                  </Table.Td>
                </Table.Tr>

                <Tooltip
                  disabled={data.liquidationCalculated.period === 0}
                  label={
                    <Stack gap={5} py={3}>
                      <Table withTableBorder withColumnBorders>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td>Kỳ tính lãi</Table.Td>
                            <Table.Td fw={700}>
                              {data.liquidationCalculated.period} (
                              {renderDate(data.liquidationCalculated.periodStartAt)})
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td>Số ngày tính lãi</Table.Td>
                            <Table.Td fw={700}>
                              {num(data.liquidationCalculated.periodFeeDays)}
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td>Lãi mỗi ngày</Table.Td>
                            <Table.Td fw={700}>
                              {num(data.liquidationCalculated.periodFeePerDay)}
                            </Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Stack>
                  }
                >
                  <Table.Tr>
                    <Table.Td>{t("periodFeeAmount")}</Table.Td>

                    <Table.Td ta="right">
                      {num(data.liquidationCalculated.periodFeeAmount, { type: "money" })}
                    </Table.Td>
                  </Table.Tr>
                </Tooltip>

                <Table.Tr>
                  <Table.Td>
                    {t("remainCapitalAmountFee")} (
                    {num(data.liquidationCalculated.remainCapitalAmountFeePercent)}%)
                  </Table.Td>
                  <Table.Td ta="right">
                    {num(data.liquidationCalculated.remainCapitalAmountFee, { type: "money" })}
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>{t("loan_receipt_late_interest")}</Table.Td>
                  <Table.Td ta="right">
                    {num(data.liquidationCalculated.lateInterestAmount, { type: "money" })}
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            {data.lateInterest && (
              <Fragment>
                <Table.Tr>
                  <Table.Td>Số ngày chậm trả</Table.Td>

                  <Table.Td ta="right">{num(data.lateInterest.days)}</Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>Tỷ lệ phạt</Table.Td>

                  <Table.Td ta="right">{num(data.lateInterest.rate)}%</Table.Td>
                </Table.Tr>
              </Fragment>
            )}

            <Table.Tr>
              <Table.Td>{t("note")}</Table.Td>

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
                      __html: StringUtils.replaceLineBreaksToHTML(receipt.note || "--"),
                    }}
                  />
                </HoverToEdit>
              </Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Td>{t("total")}</Table.Td>

              <Table.Td ta="right" fw={600}>
                <Group gap={5} justify="end">
                  <TooltipIcon
                    icon={IconInfoCircle}
                    label={t("entity_updated", { entity: t("money_amount") })}
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
                    <NumberCurrencyFormatter value={receipt.amount} />
                  </HoverToEdit>
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        {(function () {
          if (receipt.status === ReceiptStatus.PENDING) {
            return (
              <Stack align="center">
                {isExpired && (
                  <Badge color="red" variant="light">
                    {t("expired")}
                  </Badge>
                )}

                <Group justify="center">
                  <Button
                    onClick={() => OnModalPayReceipt({ receipt })}
                    leftIcon={IconCashRegister}
                    disabled={!isAbleToPay}
                  >
                    {t("pay")}
                  </Button>
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
                      {t("partial_payment")}
                    </Group>
                  </Anchor>
                </Renderer>
              </Stack>
            );
          }

          if (receipt.status === ReceiptStatus.PAID) {
            return (
              <Group justify="center">
                <Badge color="green" variant="light">
                  Đã thanh toán
                </Badge>
              </Group>
            );
          }
        })()}
      </Stack>
    </Card>
  );
};
