"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import { getCustomerKyc } from "@/modules/customer-kycs/customer-kycs-service";
import { getCustomer } from "@/modules/customers/customer-service";
import { getClientLocale } from "@/modules/lang/lang-service";
import { LoanRowInfo } from "@/modules/loans/components/loan-row-info";
import {
  loanLiquidation,
  loanLiquidationCalculate,
  renderLoanPeriod,
} from "@/modules/loans/loans-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import { type ModalPayReceiptRef } from "@/modules/receipts/modals/modal-pay-receipt";
import { onActionLoad } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Box, Card, Center, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBrandSpeedtest } from "@tabler/icons-react";
import { FC, Fragment, useRef, useState } from "react";
import { loanAssetTypes } from "../loans-constants";
import dynamic from "next/dynamic";
import { nonLoading } from "@/utils/non-loading";

const ModalPayReceipt = dynamic(
  () => import("@/modules/receipts/modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const ModalLoanLiquidation: FC<LoanEntity> = (loan) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalPayReceiptRef = useRef<ModalPayReceiptRef | null>(null);

  const state = useFetch({
    fetch: async () => {
      const [customer, customerKyc, calculated] = await Promise.all([
        getCustomer(loan.customerId),
        getCustomerKyc(loan.customerId),
        loanLiquidationCalculate(loan.id),
      ]);

      return {
        customer,
        customerKyc,
        calculated,
      };
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
          await loanLiquidation(loan.id).then((receipt) => {
            onClose();
            modalPayReceiptRef.current?.open({ receipt });
          });
        } catch (error) {
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  if (!state.isInitialized) return <Skeleton height={300} />;
  if (state.error || !state.data) return <Errored error={state.error} />;

  const { customerKyc, calculated, customer } = state.data;
  const kyc = customerKyc.versions[customerKyc.versions.length - 1];

  return (
    <Stack>
      <Card withBorder p={10}>
        <Stack>
          <Group gap={16} align="start">
            <Avatar customer={customer} mt={5} size={50} />
            <Stack gap={0}>
              <Text fw={700}>{kyc.cidFullName}</Text>
              <Text fz={em(12)} c="gray">
                {t`Birthday`}:{" "}
                {kyc.cidBirthday && <DateFormat value={kyc.cidBirthday} type="date" />}
              </Text>
              <Text fz={em(12)} c="gray">
                {t`Phone`}: {customer.phone}
              </Text>
            </Stack>
          </Group>

          <LoanRowInfo
            label={<Trans>Loan asset type</Trans>}
            value={loanAssetTypes[loan.assetType].label()}
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
              getClientLocale()
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
        <Button miw={200} action color="orange" onClick={() => onSubmit()} loading={isSubmitting}>
          <Trans>Liquidation</Trans>
        </Button>
      </Center>

      <ModalPayReceipt ref={modalPayReceiptRef} />
    </Stack>
  );
};

export const OnModalLoanLiquidation = (loan: LoanEntity) => {
  return modals.open({
    size: "xl",
    modalId: "ModalLoanLiquidation",
    title: (
      <ModalHead name={<Trans>Loan liquidation</Trans>} color="orange" icon={IconBrandSpeedtest} />
    ),
    children: <ModalLoanLiquidation {...loan} />,
  });
};
