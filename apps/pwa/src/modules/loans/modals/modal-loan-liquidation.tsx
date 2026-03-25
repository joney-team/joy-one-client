"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import { EventType } from "@/graphql/enums.graphql";
import { useCustomerKyc } from "@/modules/customer-kycs/hooks/use-customer-kyc";
import QUERY_CUSTOMER from "@/modules/customers/graphql/queryCustomer.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { getClientLocale } from "@/modules/lang/lang-service";
import { LoanRowInfo } from "@/modules/loans/components/loan-row-info";
import { renderLoanPeriod } from "@/modules/loans/loans-service";
import { onActionLoad } from "@/utils/actions";
import { useMutation, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Box, Card, Center, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBrandSpeedtest } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";
import { LoanDataFragment } from "../graphql/fragmentLoan.graphql";
import MUTATION_LIQUIDATE_LOAN from "../graphql/mutationLiquidateLoan.graphql";
import QUERY_LIQUIDATE_LOAN_CALCULATE from "../graphql/queryLiquidateLoanCalculate.graphql";
import { loanAssetTypes } from "../loans-constants";

interface ModalLoanLiquidationProps {
  loan: LoanDataFragment;
  onLiquidated: (receiptId: string) => void;
}

export const ModalLoanLiquidation: FC<ModalLoanLiquidationProps> = ({ loan, onLiquidated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLingui();

  const [liquidateLoan] = useMutation(MUTATION_LIQUIDATE_LOAN);

  const {
    data: customerData,
    refetch: customerRefetch,
    error: customerError,
  } = useQuery(QUERY_CUSTOMER, {
    variables: {
      id: loan.customerId ?? "",
    },
    skip: !loan.customerId,
  });

  useEventsListener([EventType.CustomerUpdated], () => {
    customerRefetch();
  });

  const {
    customerKyc,
    loading: customerKycLoading,
    error: customerKycError,
  } = useCustomerKyc(loan.customerId);

  const {
    data: calculatedData,
    loading: calculatedLoading,
    error: calculatedError,
  } = useQuery(QUERY_LIQUIDATE_LOAN_CALCULATE, {
    variables: {
      loanId: loan.id,
    },
  });

  const onClose = () => modals.close("ModalLoanLiquidation");

  const onSubmit = async () => {
    setIsSubmitting(true);
    onActionLoad({
      name: <Trans>Loan liquidation</Trans>,
      icon: IconBrandSpeedtest,
      process: async () => {
        try {
          const result = await liquidateLoan({
            variables: {
              liquidateLoanId: loan.id,
            },
          });

          if (!result.data) return;

          onClose();
          onLiquidated(result.data.liquidateLoan);
        } catch (error) {
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  if (customerKycLoading || calculatedLoading) {
    return <Skeleton height={300} />;
  }

  if (customerKycError || calculatedError || !customerData || customerError) {
    return <Errored error={customerKycError ?? calculatedError ?? customerError} />;
  }

  const kyc = customerKyc?.versions[customerKyc.versions.length - 1];
  if (!kyc || !calculatedData?.liquidateLoanCalculate) return null;

  const calculated = calculatedData.liquidateLoanCalculate;

  return (
    <Stack>
      <Card withBorder p={10}>
        <Stack>
          <Group gap={16} align="start">
            <Avatar customer={customerData.customer} mt={5} size={50} />
            <Stack gap={0}>
              <Text fw={700}>{kyc.cidFullName}</Text>
              <Text fz={em(12)} c="gray">
                <Trans>Birthday</Trans>:{" "}
                {kyc.cidBirthday && <DateFormat value={kyc.cidBirthday} type="date" />}
              </Text>
              <Text fz={em(12)} c="gray">
                <Trans>Phone</Trans>: {customerData.customer.phone}
              </Text>
            </Stack>
          </Group>

          <LoanRowInfo
            label={<Trans>Loan asset type</Trans>}
            value={t(loanAssetTypes[loan.assetType].label)}
          />

          <LoanRowInfo
            label={<Trans>Loan period</Trans>}
            value={renderLoanPeriod(loan.package.days)}
            renderValue={(value) => (
              <Fragment>
                {value}
                {loan.paymentPeriods && (
                  <small>
                    {" ("}
                    <Trans>From</Trans>{" "}
                    {loan.paymentPeriods.find((v) => v.period === 1)?.startTime && (
                      <DateFormat
                        value={loan.paymentPeriods.find((v) => v.period === 1)?.startTime as number}
                        type="date"
                      />
                    )}{" "}
                    <Trans>To</Trans>{" "}
                    {loan.paymentPeriods[loan.paymentPeriods.length - 1].endTime && (
                      <DateFormat
                        value={loan.paymentPeriods[loan.paymentPeriods.length - 1].endTime}
                        type="date"
                      />
                    )}
                    {")"}
                  </small>
                )}
              </Fragment>
            )}
          />

          <LoanRowInfo
            label={<Trans>Loan amount</Trans>}
            value={loan.amount}
            renderValue={(value) => <CurrencyFormat value={value} />}
          />

          <LoanRowInfo
            label={<Trans>Loan payment periods</Trans>}
            value={loan.packagePeriodDays}
            renderValue={(value) => <NumberFormat value={value} />}
          />
        </Stack>
      </Card>

      <Card withBorder p={10}>
        <Stack>
          <LoanRowInfo
            label={<Trans>Remain capital amount</Trans>}
            value={calculated.remainCapitalAmount}
            renderValue={(value) => <CurrencyFormat value={value} />}
          />

          <Tooltip
            disabled={calculated.period === 0}
            label={
              <Stack gap={5} py={3}>
                <Table withTableBorder withColumnBorders>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>{<Trans>Interest period</Trans>}</Table.Td>
                      <Table.Td fw={700}>
                        {calculated.period} (
                        {calculated.periodStartAt && (
                          <DateFormat value={calculated.periodStartAt} type="date" />
                        )}
                        )
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{<Trans>Interest days</Trans>}</Table.Td>
                      <Table.Td fw={700}>
                        <NumberFormat value={calculated.periodFeeDays} />
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{<Trans>Interest per day</Trans>}</Table.Td>
                      <Table.Td fw={700}>
                        <NumberFormat value={calculated.periodFeePerDay} />
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            }
          >
            <Box w="100%">
              <LoanRowInfo
                label={<Trans>Period fee amount</Trans>}
                value={calculated.periodFeeAmount}
                renderValue={(value) => <CurrencyFormat value={value} />}
              />
            </Box>
          </Tooltip>
          <LoanRowInfo
            label={`${t`Remain capital amount fee`} (${calculated.remainCapitalAmountFeePercent.toLocaleString(
              getClientLocale(),
            )}%)`}
            value={calculated.remainCapitalAmountFee}
            renderValue={(value) => <CurrencyFormat value={value} />}
          />
          <LoanRowInfo
            label={<Trans>Loan receipt late interest</Trans>}
            value={calculated.lateInterestAmount}
            renderValue={(value) => <CurrencyFormat value={value} />}
          />

          <LoanRowInfo
            label={<Trans>Total</Trans>}
            value={calculated.feeAmount}
            renderValue={(value) => <CurrencyFormat value={value} />}
          />
        </Stack>
      </Card>

      <Text ta="center" c="orange">
        <Trans>Are you sure you want to liquidate this loan? This action cannot be undone.</Trans>
      </Text>

      <Center>
        <Button miw={200} color="orange" onClick={() => onSubmit()} loading={isSubmitting}>
          <Trans>Liquidation</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalLoanLiquidation = (state: ModalLoanLiquidationProps) => {
  return modals.open({
    size: "xl",
    modalId: "ModalLoanLiquidation",
    title: (
      <ModalHead name={<Trans>Loan liquidation</Trans>} color="orange" icon={IconBrandSpeedtest} />
    ),
    children: <ModalLoanLiquidation {...state} />,
  });
};
