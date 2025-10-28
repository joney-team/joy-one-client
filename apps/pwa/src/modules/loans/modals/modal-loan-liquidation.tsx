"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalTitle } from "@/components/modal-title";
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
import { onActionLoad } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Box, Card, Center, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBrandSpeedtest } from "@tabler/icons-react";
import { FC, useState } from "react";
import { OnModalPayReceipt } from "../../receipts/modals/modal-pay-receipt";
import { loanAssetTypes } from "../loans-constants";

export const ModalLoanLiquidation: FC<LoanEntity> = (loan) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      name: t`Loan liquidation`,
      icon: IconBrandSpeedtest,
      process: async () => {
        try {
          await loanLiquidation(loan.id).then((receipt) => {
            onClose();
            OnModalPayReceipt({ receipt });
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
          <LoanRowInfo label={t`Loan asset type`} value={loanAssetTypes[loan.assetType].label()} />
          <LoanRowInfo label={t`Loan period`} value={renderLoanPeriod(loan.package.days)} />
          <LoanRowInfo
            label={t`Loan amount`}
            value={
              <Text>
                <CurrencyFormat value={loan.amount} />
              </Text>
            }
          />
          <LoanRowInfo
            label={t`Loan payment periods`}
            value={
              <Text>
                <NumberFormat value={loan.packagePeriodDays} />
              </Text>
            }
          />
          {loan.paymentPeriods && (
            <LoanRowInfo
              label={t`Loan period range`}
              value={
                <Text>
                  {loan.paymentPeriods.find((v) => v.period === 1)?.startTime && (
                    <DateFormat
                      value={loan.paymentPeriods.find((v) => v.period === 1)?.startTime as number}
                      type="date"
                    />
                  )}
                  {" - "}
                  {loan.paymentPeriods[loan.paymentPeriods.length - 1].endTime && (
                    <DateFormat
                      value={loan.paymentPeriods[loan.paymentPeriods.length - 1].endTime}
                      type="date"
                    />
                  )}
                </Text>
              }
            />
          )}
        </Stack>
      </Card>

      <Card withBorder p={10}>
        <Stack>
          <LoanRowInfo
            label={t`Remain capital amount`}
            value={
              <Text>
                <CurrencyFormat value={calculated.remainCapitalAmount} />
              </Text>
            }
          />
          <Tooltip
            disabled={calculated.period === 0}
            label={
              <Stack gap={5} py={3}>
                <Table withTableBorder withColumnBorders>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>{t`Interest period`}</Table.Td>
                      <Table.Td fw={700}>
                        {calculated.period} (
                        {calculated.periodStartAt && (
                          <DateFormat value={calculated.periodStartAt} type="date" />
                        )}
                        )
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{t`Interest days`}</Table.Td>
                      <Table.Td fw={700}>
                        <NumberFormat value={calculated.periodFeeDays} />
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{t`Interest per day`}</Table.Td>
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
                label={t`Period fee amount`}
                value={
                  <Text>
                    <CurrencyFormat value={calculated.periodFeeAmount} />
                  </Text>
                }
              />
            </Box>
          </Tooltip>
          <LoanRowInfo
            label={`${t`Remain capital amount fee`} (${calculated.remainCapitalAmountFeePercent.toLocaleString(
              getClientLocale()
            )}%)`}
            value={
              <Text>
                <CurrencyFormat value={calculated.remainCapitalAmountFee} />
              </Text>
            }
          />
          <LoanRowInfo
            label={`${t`Loan receipt late interest`}`}
            value={
              <Text>
                <CurrencyFormat value={calculated.lateInterestAmount} />
              </Text>
            }
          />

          <LoanRowInfo
            label={t`Total`}
            value={
              <Text c="orange" fz={em(20)} fw={800}>
                <CurrencyFormat value={calculated.feeAmount} />
              </Text>
            }
          />
        </Stack>
      </Card>

      <Text ta="center" c="orange">
        {t`Liquidation message`}
      </Text>

      <Center>
        <Button miw={200} action color="orange" onClick={onSubmit} loading={isSubmitting}>
          {t`Liquidation`}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalLoanLiquidation = (loan: LoanEntity) => {
  return modals.open({
    size: "xl",
    modalId: "ModalLoanLiquidation",
    title: <ModalTitle title={t`Loan liquidation`} color="orange" icon={IconBrandSpeedtest} />,
    children: <ModalLoanLiquidation {...loan} />,
  });
};
