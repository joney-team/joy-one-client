"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { EventType, LoanStatus, ReceiptStatus, ReceiptType } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { restClient } from "@/modules/apis/rest-client";
import { useEventsListener } from "@/modules/events/event-service";
import { OnModalLoanLiquidation } from "@/modules/loans/modals/modal-loan-liquidation";
import QUERY_RECEIPTS from "@/modules/receipts/graphql/queryReceipts.graphql";
import { OnModalReceiptForm } from "@/modules/receipts/modals/modal-receipt-form";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useMutation, useQuery } from "@apollo/client/react";
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
import { LoanDataFragment } from "../graphql/fragmentLoan.graphql";
import MUTATION_HEALTH_CHECK_LOAN from "../graphql/mutationHealthCheckLoan.graphql";
import MUTATION_REVERT_LIQUIDATION_LOAN from "../graphql/mutationRevertLiquidationLoan.graphql";
import { LoanReceiptCard } from "./loan-receipt-card";
import { LoanRowInfo } from "./loan-row-info";

interface LoanPaymentsProps {
  loan: LoanDataFragment;
  refetch: () => void;
}

export const LoanPayments: FC<LoanPaymentsProps> = (props) => {
  const color = useColor();
  const { loan, refetch } = props;
  const { hasPermission } = useWorkspace();
  const [healthCheckLoan] = useMutation(MUTATION_HEALTH_CHECK_LOAN);
  const [revertLiquidationLoan] = useMutation(MUTATION_REVERT_LIQUIDATION_LOAN);

  const {
    data: receiptsData,
    loading,
    refetch: refetchReceipts,
  } = useQuery(QUERY_RECEIPTS, {
    variables: {
      query: {
        relatedLoanId: loan?.id,
        type: ReceiptType.Income,
        getAll: true,
      },
    },
  });

  useEventsListener(
    [
      EventType.ReceiptNew,
      EventType.ReceiptPaid,
      EventType.ReceiptUpdated,
      EventType.ReceiptDisbursement,
      EventType.ReceiptArchived,
      EventType.ReceiptUnarchived,
      EventType.ReceiptChangeWorkspaceBranch,
    ],
    () => refetchReceipts(),
  );

  const receipts = receiptsData?.list.results || [];

  const liquidationReceipt = receipts.find(
    (v) => v.type === ReceiptType.Income && v.data?.liquidation,
  );
  const isAbleToLiquidation =
    loan?.status !== LoanStatus.Completed &&
    receipts.filter((v) => v.type === ReceiptType.Income && v.status === ReceiptStatus.Pending)
      .length >= 2;

  const onRevertFulfill = async () => {
    if (!loan || !hasPermission(WorkspacePermission.LOANS_FULFILLED_REVERTED)) return;
    onConfirmModal({
      content: <Trans>Are you sure you want to revert the payment?</Trans>,
      onConfirm: () => restClient.post(`/loans/${loan.id}/revert-fulfilled`),
    });
  };

  const onRevertLiquidation = async () => {
    if (!loan) return;
    onConfirmModal({
      content: <Trans>Are you sure you want to revert the liquidation?</Trans>,
      onConfirm: () => revertLiquidationLoan({ variables: { revertLiquidationLoanId: loan.id } }),
    });
  };

  if (!loan || !loan.paymentPeriods || loading) return <Skeleton h={200} />;

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
            loan.status !== LoanStatus.Completed
          }
        >
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertFulfill}>
            {t`Revert fulfilled`}
          </Button>
        </Renderer>

        <Renderer visible={!!liquidationReceipt && loan.status !== LoanStatus.Completed}>
          <Button color="red" variant="subtle" leftIcon={IconRefresh} onClick={onRevertLiquidation}>
            {t`Revert liquidation`}
          </Button>
        </Renderer>

        <Button
          color="gray"
          variant="subtle"
          leftIcon={IconCircleDashedCheck}
          onClick={() => healthCheckLoan({ variables: { healthCheckLoanId: loan.id } })}
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
                  const relatedReceipts = receipts.filter(
                    (v) =>
                      v.type === ReceiptType.Income &&
                      (v.data?.period?.period === paymentPeriod.period ||
                        v.data?.lateInterest?.period === paymentPeriod.period),
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
                                  receipts={receipts}
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
                                  type: ReceiptType.Income,
                                  data: {
                                    period: {
                                      period: paymentPeriod.period,
                                    },
                                  },
                                  relatedCustomer: loan.customer,
                                  relatedLoan: loan,
                                  onDone: () => refetch(),
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
                          receipts={receipts}
                          loan={loan}
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
            const relatedReceipts = receipts.filter(
              (v) =>
                v.type === ReceiptType.Income &&
                (v.data?.period?.period === paymentPeriod.period ||
                  v.data?.lateInterest?.period === paymentPeriod.period),
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
                            <LoanReceiptCard receipt={receipt} loan={loan} receipts={receipts} />
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
                              type: ReceiptType.Income,
                              data: {
                                period: {
                                  period: paymentPeriod.period,
                                },
                              },
                              relatedCustomer: loan.customer,
                              relatedLoan: loan,
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
