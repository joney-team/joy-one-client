"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { api } from "@/modules/apis";
import { healthCheckLoan, revertLiquidationLoan } from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { OnModalLoanLiquidation } from "@/modules/loans/modals/modal-loan-liquidation";
import { OnModalReceiptForm } from "@/modules/receipts/modals/modal-receipt-form";
import { getReceipts } from "@/modules/receipts/receipts-service";
import { ReceiptStatus, ReceiptType } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch, UseFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Card, Center, Group, Skeleton, Stack, Table, Text } from "@mantine/core";
import {
  IconBrandSpeedtest,
  IconCircleDashedCheck,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { LoanReceiptCard } from "./loan-receipt-card";
import { LoanRowInfo } from "./loan-row-info";
import { EventType } from "@/graphql/enums.graphql";

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
      EventType.ReceiptNew,
      EventType.ReceiptPaid,
      EventType.ReceiptUpdated,
      EventType.ReceiptDisbursement,
      EventType.ReceiptArchived,
      EventType.ReceiptUnarchived,
      EventType.ReceiptChangeWorkspaceBranch,
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
    onConfirmModal({
      content: <Trans>Are you sure you want to revert the payment?</Trans>,
      onConfirm: () => api.post(`/loans/${loan.id}/revert-fulfilled`),
    });
  };

  const onRevertLiquidation = async () => {
    if (!loan) return;
    onConfirmModal({
      content: <Trans>Are you sure you want to revert the liquidation?</Trans>,
      onConfirm: () => revertLiquidationLoan(loan.id),
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
            onClick={() => OnModalLoanLiquidation(loan)}
          >
            <Trans>Liquidation</Trans>
          </Button>
        </Renderer>

        <Renderer
          visible={
            hasPermission(WorkspacePermission.LOANS_FULFILLED_REVERTED) &&
            loan.status !== LoanStatus.COMPLETED
          }
        >
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertFulfill}>
            {t`Revert fulfilled`}
          </Button>
        </Renderer>

        <Renderer visible={!!liquidationReceipt && loan.status !== LoanStatus.COMPLETED}>
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertLiquidation}>
            {t`Revert liquidation`}
          </Button>
        </Renderer>

        <Button
          color="gray"
          variant="subtle"
          leftIcon={IconCircleDashedCheck}
          onClick={() => healthCheckLoan(loan.id)}
        >
          {t`Check`}
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
                    {t`Period`}
                  </Table.Th>
                  <Table.Th w={250}>{t`Time`}</Table.Th>
                  <Table.Th>{t`Interest`}</Table.Th>
                  <Table.Th>{t`Principal`}</Table.Th>
                  <Table.Th>{t`Total`}</Table.Th>
                  <Table.Th>{t`Receipts`}</Table.Th>
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
                            <Trans>From</Trans>:{" "}
                            {paymentPeriod.startTime && (
                              <DateFormat value={paymentPeriod.startTime} type="date" />
                            )}
                          </Text>
                          <Text>
                            <Trans>To</Trans>:{" "}
                            {paymentPeriod.endTime && (
                              <DateFormat value={paymentPeriod.endTime} type="date" />
                            )}
                          </Text>
                        </Stack>
                      </Table.Td>

                      <Table.Td>
                        <CurrencyFormat
                          value={paymentPeriod.totalAmount - paymentPeriod.capitalAmount}
                        />
                      </Table.Td>

                      <Table.Td>
                        <CurrencyFormat value={paymentPeriod.capitalAmount} />
                      </Table.Td>

                      <Table.Td>
                        <CurrencyFormat value={paymentPeriod.totalAmount} />
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
                              <Trans>Add receipt</Trans>
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
                      <Text ta="center">
                        <Trans>Liquidation</Trans>
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <CurrencyFormat
                        value={
                          liquidationReceipt.amount -
                          (liquidationReceipt.data?.liquidationCalculated?.remainCapitalAmount || 0)
                        }
                      />
                    </Table.Td>

                    <Table.Td>
                      <CurrencyFormat
                        value={liquidationReceipt.data?.liquidationCalculated?.remainCapitalAmount}
                      />
                    </Table.Td>

                    <Table.Td>
                      <CurrencyFormat value={liquidationReceipt.amount} />
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
                      <Trans>Period</Trans>:{" "}
                      {paymentPeriod.period > 0 ? paymentPeriod.period : "--"}
                    </Text>
                    <Text px={16} py={5} fz={12} fw={500} c="white">
                      {paymentPeriod.startTime && (
                        <DateFormat value={paymentPeriod.startTime} type="date" />
                      )}
                      {" - "}
                      {paymentPeriod.endTime && (
                        <DateFormat value={paymentPeriod.endTime} type="date" />
                      )}
                    </Text>
                  </Group>

                  <Stack px={16}>
                    <LoanRowInfo
                      label={<Trans>Interest</Trans>}
                      value={paymentPeriod.totalAmount - paymentPeriod.capitalAmount}
                      renderValue={(value) => <CurrencyFormat value={value} />}
                    />
                    <LoanRowInfo
                      label={<Trans>Principal</Trans>}
                      value={paymentPeriod.capitalAmount}
                      renderValue={(value) => <CurrencyFormat value={value} />}
                    />
                    <LoanRowInfo
                      label={<Trans>Total</Trans>}
                      value={paymentPeriod.totalAmount}
                      renderValue={(value) => <CurrencyFormat value={value} />}
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
                          <Trans>Add receipt</Trans>
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
                <Trans>Liquidation</Trans>
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
