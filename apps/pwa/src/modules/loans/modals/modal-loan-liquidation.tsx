import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import { onActionLoad } from "@/utils/actions";
import { getCustomerKyc } from "@/modules/customer-kycs/customer-kycs-service";
import { getCustomer } from "@/modules/customers/customer-service";
import { num, renderDate, tl } from "@/modules/lang/lang-service";
import {
  loanLiquidation,
  loanLiquidationCalculate,
  renderLoanPeriod,
} from "@/modules/loans/loans-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import { useFetch } from "@/utils/use-fetch.util";
import { Box, Card, Center, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBrandSpeedtest } from "@tabler/icons-react";
import { FC, useState } from "react";
import { OnModalPayReceipt } from "../../receipts/modals/modal-pay-receipt";
import { LoanRowInfo } from "@/modules/loans/components/loan-row-info";

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
      name: tl("loan_liquidation"),
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
                {tl("birthday")}: {renderDate(kyc.cidBirthday)}
              </Text>
              <Text fz={em(12)} c="gray">
                {tl("phone")}: {customer.phone}
              </Text>
            </Stack>
          </Group>
          <LoanRowInfo
            label={tl("loan_asset_type")}
            value={tl(`loan_asset_type_${loan.assetType}`)}
          />
          <LoanRowInfo label={tl("loan_period")} value={renderLoanPeriod(loan.package.days)} />
          <LoanRowInfo label={tl("loan_amount")} value={num(loan.amount, { type: "money" })} />
          <LoanRowInfo label={tl("loan_payment_periods")} value={num(loan.packagePeriodDays)} />
          {loan.paymentPeriods && (
            <LoanRowInfo
              label={tl("loan_period_range")}
              value={`${renderDate(
                loan.paymentPeriods.find((v) => v.period === 1)?.startTime
              )} - ${renderDate(loan.paymentPeriods[loan.paymentPeriods.length - 1].endTime)}`}
            />
          )}
        </Stack>
      </Card>

      <Card withBorder p={10}>
        <Stack>
          <LoanRowInfo
            label={tl("remainCapitalAmount")}
            value={num(calculated.remainCapitalAmount, { type: "money" })}
          />
          <Tooltip
            disabled={calculated.period === 0}
            label={
              <Stack gap={5} py={3}>
                <Table withTableBorder withColumnBorders>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Kỳ tính lãi</Table.Td>
                      <Table.Td fw={700}>
                        {calculated.period} ({renderDate(calculated.periodStartAt)})
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Số ngày tính lãi</Table.Td>
                      <Table.Td fw={700}>{num(calculated.periodFeeDays)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Lãi mỗi ngày</Table.Td>
                      <Table.Td fw={700}>{num(calculated.periodFeePerDay)}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            }
          >
            <Box w="100%">
              <LoanRowInfo
                label={tl("periodFeeAmount")}
                value={num(calculated.periodFeeAmount, { type: "money" })}
              />
            </Box>
          </Tooltip>
          <LoanRowInfo
            label={`${tl("remainCapitalAmountFee")} (${num(
              calculated.remainCapitalAmountFeePercent
            )}%)`}
            value={num(calculated.remainCapitalAmountFee, { type: "money" })}
          />
          <LoanRowInfo
            label={`${tl("loan_receipt_late_interest")}`}
            value={num(calculated.lateInterestAmount, { type: "money" })}
          />

          <LoanRowInfo
            label={tl("total")}
            value={
              <Text c="orange" fz={em(20)} fw={800}>
                {num(calculated.feeAmount, { type: "money" })}
              </Text>
            }
          />
        </Stack>
      </Card>

      <Text ta="center" c="orange">
        {tl("liquidation_msg")}
      </Text>

      <Center>
        <Button miw={200} action color="orange" onClick={onSubmit} loading={isSubmitting}>
          {tl("liquidation")}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalLoanLiquidation = (loan: LoanEntity) => {
  return modals.open({
    size: "xl",
    modalId: "ModalLoanLiquidation",
    title: <ModalTitle title={tl("loan_liquidation")} color="orange" icon={IconBrandSpeedtest} />,
    children: <ModalLoanLiquidation {...loan} />,
  });
};
