"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { NumberCurrencyFormatter } from "@/components/number-currency-formatter";
import { Renderer } from "@/components/renderer";
import { EventType } from "@/modules/events/event-types";
import { renderDate, t, tMulti } from "@/modules/lang/lang-service";
import { healthCheckLoan, revertLiquidationLoan } from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { OnModalLoanLiquidation } from "@/modules/loans/modals/modal-loan-liquidation";
import { OnModalReceiptForm } from "@/modules/receipts/modals/modal-receipt-form";
import { getReceipts } from "@/modules/receipts/receipts-service";
import { ReceiptStatus, ReceiptType } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad } from "@/utils/actions";
import { useFetch, UseFetch } from "@/utils/use-fetch.util";
import { Card, Center, Group, Skeleton, Stack, Table, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import {
  IconBrandSpeedtest,
  IconCircleDashedCheck,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { LoanReceiptCard } from "./loan-receipt-card";
import { LoanRowInfo } from "./loan-row-info";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { api } from "@/modules/apis";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

interface LoanPaymentsProps {
  loan: UseFetch<LoanEntity>;
}

export const LoanPayments: FC<LoanPaymentsProps> = (props) => {
  const color = useColor();
  const loan = props.loan.data;
  const { hasPermission } = useWorkspace();

  const receipts = useFetch({
    id: `loan_${loan?.id}_receipts`,
    fetch: () =>
      getReceipts({
        relatedLoanId: loan?.id,
        type: ReceiptType.INCOME,
        getAll: true,
      }).then((res) => res.data),
    refetchEvents: [
      EventType.RECEIPT_NEW,
      EventType.RECEIPT_PAID,
      EventType.RECEIPT_UPDATED,
      EventType.RECEIPT_DISBURSEMENT,
      EventType.RECEIPT_ARCHIVED,
      EventType.RECEIPT_UNARCHIVED,
      EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH,
    ],
  });

  const liquidationReceipt = (receipts.data || []).find(
    (v) => v.type === ReceiptType.INCOME && v.data?.liquidation
  );
  const isAbleToLiquidation =
    loan?.status !== LoanStatus.COMPLETED &&
    (receipts.data || []).filter(
      (v) => v.type === ReceiptType.INCOME && v.status === ReceiptStatus.PENDING
    ).length >= 2;

  const onRevertFulfill = async () => {
    if (!loan || !hasPermission(WorkspacePermission.LOANS_FULFILLED_REVERTED)) return;
    openConfirmModal({
      title: <ModalTitle color="red" title={t("confirm")} icon={IconRefresh} />,
      children: "Bạn có chắc chắn muốn hoàn tác thanh toán này?",
      color: "red",
      onConfirm: () =>
        onActionLoad({
          name: t("event_type_" + EventType.LOANS_FULFILLED_REVERTED),
          process: () => api.post(`/loans/${loan.id}/revert-fulfilled`),
        }),
      labels: { confirm: "Tiếp tục", cancel: "Hủy" },
      confirmProps: { color: "red" },
    });
  };

  const onRevertLiquidation = async () => {
    if (!loan) return;
    openConfirmModal({
      title: <ModalTitle color="red" title={t("confirm")} icon={IconRefresh} />,
      children: "Bạn có chắc chắn muốn hoàn tác thanh toán này?",
      color: "red",
      onConfirm: () =>
        onActionLoad({
          name: t("event_type_" + EventType.LOANS_REVERT_LIQUIDATION),
          process: () => revertLiquidationLoan(loan.id),
        }),
      labels: { confirm: "Tiếp tục", cancel: "Hủy" },
      confirmProps: { color: "red" },
    });
  };

  if (!loan || !loan.paymentPeriods || !receipts.isInitialized) return <Skeleton h={200} />;

  const CTAs: FC = () => {
    return (
      <Fragment>
        <Renderer visible={!!isAbleToLiquidation}>
          <Button
            color="orange"
            variant="subtle"
            leftIcon={IconBrandSpeedtest}
            onClick={() => {
              OnModalLoanLiquidation(loan);
            }}
          >
            {t("liquidation")}
          </Button>
        </Renderer>

        <Renderer
          visible={
            hasPermission(WorkspacePermission.LOANS_FULFILLED_REVERTED) &&
            loan.status !== LoanStatus.COMPLETED
          }
        >
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertFulfill}>
            {t(`permission_${WorkspacePermission.LOANS_FULFILLED_REVERTED}`)}
          </Button>
        </Renderer>

        <Renderer visible={!!liquidationReceipt && loan.status !== LoanStatus.COMPLETED}>
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertLiquidation}>
            {t("revert_liquidation")}
          </Button>
        </Renderer>

        <Renderer visible={!!liquidationReceipt && loan.status !== LoanStatus.COMPLETED}>
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertLiquidation}>
            {t("revert_liquidation")}
          </Button>
        </Renderer>

        <Button
          color="gray"
          variant="subtle"
          leftIcon={IconCircleDashedCheck}
          onClick={() => healthCheckLoan(loan.id)}
        >
          {t("check")}
        </Button>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <Renderer views={["desktop", "tablet"]}>
        <Card shadow="xs" p={0}>
          <Stack>
            <Table
              striped
              style={{
                borderBottom:
                  "calc(0.0625rem* var(--mantine-scale)) solid var(--table-border-color)",
              }}
              withColumnBorders
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={100} ta="center">
                    {t("period")}
                  </Table.Th>
                  <Table.Th w={250}>{t("time")}</Table.Th>
                  <Table.Th>Thu lãi</Table.Th>
                  <Table.Th>Thu gốc</Table.Th>
                  <Table.Th>{t("total")}</Table.Th>
                  <Table.Th>{t("receipts")}</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {loan.paymentPeriods.map((paymentPeriod, i) => {
                  const relatedReceipts = (receipts.data || []).filter(
                    (v) =>
                      v.type === ReceiptType.INCOME &&
                      (v.data?.period?.period === paymentPeriod.period ||
                        v.data?.lateInterest?.period === paymentPeriod.period)
                  );

                  return (
                    <Table.Tr key={i}>
                      <Table.Td ta="center">
                        {paymentPeriod.period > 0 ? paymentPeriod.period : "--"}
                      </Table.Td>

                      <Table.Td>
                        <Stack gap={8}>
                          <Text>
                            {t("from")}: {renderDate(paymentPeriod.startTime)}
                          </Text>
                          <Text>
                            {t("to")}: {renderDate(paymentPeriod.endTime)}
                          </Text>
                        </Stack>
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter
                          value={paymentPeriod.totalAmount - paymentPeriod.capitalAmount}
                        />
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter value={paymentPeriod.capitalAmount} />
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter value={paymentPeriod.totalAmount} />
                      </Table.Td>

                      <Table.Td w={340}>
                        <Stack py={10}>
                          {relatedReceipts.map((receipt) => {
                            return (
                              <Stack
                                key={receipt.id}
                                style={{
                                  maxWidth: "100%",
                                  width: 320,
                                }}
                              >
                                <LoanReceiptCard
                                  receipt={receipt}
                                  loan={loan}
                                  refetch={props.loan.fetch}
                                  receipts={receipts.data || []}
                                />
                              </Stack>
                            );
                          })}

                          <Group>
                            <Button
                              leftIcon={IconPlus}
                              variant="subtle"
                              size="xs"
                              color="gray"
                              onClick={() =>
                                OnModalReceiptForm({
                                  type: ReceiptType.INCOME,
                                  data: {
                                    period: {
                                      period: paymentPeriod.period,
                                    },
                                  },
                                  relatedCustomer: loan.customer,
                                  relatedLoan: loan,
                                  onDone: () => props.loan.fetch({ isSilient: true }),
                                })
                              }
                            >
                              {tMulti(["add"], ["receipt"])}
                            </Button>
                          </Group>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}

                {!!liquidationReceipt && (
                  <Table.Tr>
                    <Table.Td colSpan={2}>
                      <Text ta="center">{t("liquidation")}</Text>
                    </Table.Td>

                    <Table.Td>
                      <NumberCurrencyFormatter
                        value={
                          liquidationReceipt.amount -
                          (liquidationReceipt.data?.liquidationCalculated?.remainCapitalAmount || 0)
                        }
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberCurrencyFormatter
                        value={liquidationReceipt.data?.liquidationCalculated?.remainCapitalAmount}
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberCurrencyFormatter value={liquidationReceipt.amount} />
                    </Table.Td>

                    <Table.Td>
                      <Stack
                        py={10}
                        style={{
                          maxWidth: "100%",
                          width: 300,
                        }}
                      >
                        <LoanReceiptCard
                          receipt={liquidationReceipt}
                          receipts={receipts.data || []}
                          loan={loan}
                          refetch={() => props.loan.fetch({ isSilient: true })}
                        />
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>

            <Center pb={10}>
              <CTAs />
            </Center>
          </Stack>
        </Card>
      </Renderer>

      <Renderer views={["mobile"]}>
        <Stack>
          {loan.paymentPeriods.map((paymentPeriod, i) => {
            const relatedReceipts = (receipts.data || []).filter(
              (v) =>
                v.type === ReceiptType.INCOME &&
                (v.data?.period?.period === paymentPeriod.period ||
                  v.data?.lateInterest?.period === paymentPeriod.period)
            );

            return (
              <Card key={i} shadow="xs" p={0}>
                <Stack>
                  <Group bg={color("primary")} justify="space-between">
                    <Text px={16} py={5} fz={14} fw={700} c="white">
                      Kỳ {paymentPeriod.period > 0 ? paymentPeriod.period : "--"}
                    </Text>
                    <Text px={16} py={5} fz={12} fw={500} c="white">
                      {renderDate(paymentPeriod.startTime)} - {renderDate(paymentPeriod.endTime)}
                    </Text>
                  </Group>

                  <Stack px={16}>
                    <LoanRowInfo
                      label="Thu lãi"
                      value={
                        <NumberCurrencyFormatter
                          value={paymentPeriod.totalAmount - paymentPeriod.capitalAmount}
                        />
                      }
                    />
                    <LoanRowInfo
                      label="Thu gốc"
                      value={<NumberCurrencyFormatter value={paymentPeriod.capitalAmount} />}
                    />
                    <LoanRowInfo
                      label="Tổng"
                      value={<NumberCurrencyFormatter value={paymentPeriod.totalAmount} />}
                    />

                    <Stack py={10}>
                      {relatedReceipts.map((receipt) => {
                        return (
                          <Stack key={receipt.id}>
                            <LoanReceiptCard
                              receipt={receipt}
                              loan={loan}
                              refetch={props.loan.fetch}
                              receipts={receipts.data || []}
                            />
                          </Stack>
                        );
                      })}

                      <Center>
                        <Button
                          leftIcon={IconPlus}
                          variant="subtle"
                          size="xs"
                          color="gray"
                          onClick={() =>
                            OnModalReceiptForm({
                              type: ReceiptType.INCOME,
                              data: {
                                period: {
                                  period: paymentPeriod.period,
                                },
                              },
                              relatedCustomer: loan.customer,
                              relatedLoan: loan,
                              onDone: () => props.loan.fetch({ isSilient: true }),
                            })
                          }
                        >
                          {tMulti(["add"], ["receipt"])}
                        </Button>
                      </Center>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            );
          })}

          <Renderer visible={isAbleToLiquidation}>
            <Center>
              <Button
                color="orange"
                variant="subtle"
                leftIcon={IconBrandSpeedtest}
                onClick={() => {
                  OnModalLoanLiquidation(loan);
                }}
              >
                {t("liquidation")}
              </Button>
            </Center>
          </Renderer>

          <Center pb={10}>
            <CTAs />
          </Center>
        </Stack>
      </Renderer>
    </Fragment>
  );
};
