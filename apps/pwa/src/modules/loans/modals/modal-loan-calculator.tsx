"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { ModalHead } from "@/components/modal/modal-head";
import { LoanAssetType } from "@/graphql/enums.graphql";
import { useLoans } from "@/modules/loans/loans-context";
import { renderLoanPeriod } from "@/modules/loans/loans-service";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Badge,
  Card,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextProps,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCalculator } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useMemo, useState } from "react";
import QUERY_CALCULATE_LOAN_PAYMENT_PLAN from "../graphql/queryCalculateLoanPaymentPlan.graphql";
import { loanAssetTypes, loanPackageTypes } from "../loans-constants";

export const ModalLoanCalculator: FC<{ children: (open: () => void) => ReactNode }> = ({
  children,
}) => {
  const { workspaceSetting } = useWorkspaceSetting();

  const loans = useLoans();
  const { t } = useLingui();

  const [opened, { open, close }] = useDisclosure(false);

  const [amount, setAmount] = useState<any>(1 * 1e7);
  const [assetType, setAssetType] = useState<any>(LoanAssetType.MotobikeRegistration);
  const [_packageDays, setPackageDays] = useState<any>(180);
  const [_packagePeriodDays, setPackagePeriodDays] = useState<any>(30);
  const [startTime, setStartTime] = useState(DateTime.toSeconds(new Date()));

  const onClose = async () => {
    close();
  };

  const loanPackages = workspaceSetting?.loanSettings?.loanPackages ?? [];

  const assetTypeOptions: LoanAssetType[] = loanPackages.reduce((output, p) => {
    return Array.from([...(new Set([...output, ...p.assetTypes]) as any)]);
  }, [] as LoanAssetType[]);

  const packageDaysOptions = loanPackages.reduce((output, p) => {
    if (assetType && p.assetTypes.includes(assetType)) {
      output = Array.from([...(new Set([...output, p.days]) as any)]);
    }

    return output;
  }, [] as number[]);

  const packageDays = packageDaysOptions.find((d) => d === _packageDays) ?? packageDaysOptions[0];

  const packagePeriodDaysOptions = loanPackages.reduce((output, p) => {
    if (assetType && p.assetTypes.includes(assetType) && packageDays && p.days === packageDays) {
      return p.periodDaysOptions;
    }
    return output;
  }, [] as number[]);
  const packagePeriodDays =
    packagePeriodDaysOptions.find((d) => d === _packagePeriodDays) ?? packagePeriodDaysOptions[0];

  const loanPackage = workspaceSetting?.loanSettings?.loanPackages?.find(
    (p) => assetType && p.assetTypes.includes(assetType) && p.days === packageDays,
  );

  const { data: paymentPlanData, loading: paymentPlanLoading } = useQuery(
    QUERY_CALCULATE_LOAN_PAYMENT_PLAN,
    {
      variables: {
        input: {
          packageId: loanPackage?.id ?? "",
          amount,
          startTime,
        },
      },
      skip: !loanPackage?.id || typeof amount !== "number" || !startTime || !opened,
    },
  );

  const paymentPeriods = useMemo(() => {
    return (
      paymentPlanData?.calculateLoanPaymentPlan?.paymentPeriods.find(
        (v) => v.periodDays === packagePeriodDays,
      )?.periods || []
    );
  }, [paymentPlanData, packagePeriodDays]);

  if (!loans.isInitialized || !loans.assetEstimations) return null;

  return (
    <Fragment>
      {children(open)}

      <Modal
        title={<ModalHead name={<Trans>Loan package calculator</Trans>} icon={IconCalculator} />}
        onClose={onClose}
        opened={opened}
        size={1000}
      >
        <Stack gap={16}>
          <Group>
            <NumberInput
              flex={1}
              label={<Trans>Loan amount</Trans>}
              placeholder={t`Enter loan amount`}
              hideControls
              value={amount}
              onChange={(value) => setAmount(+value)}
            />

            <DateTimePicker
              flex={1}
              label={<Trans>Fulfill at</Trans>}
              value={startTime ? new Date(startTime * 1000) : null}
              onChange={(d) => {
                if (!d) return;
                setStartTime(DateTime.toSeconds(d));
              }}
            />
          </Group>

          <SimpleGrid cols={{ md: 3 }}>
            <Select
              label={<Trans>Asset type</Trans>}
              data={assetTypeOptions.map((type) => ({
                value: type,
                label: t(loanAssetTypes[type].label),
              }))}
              value={assetType}
              onChange={(e) => {
                setAssetType(e as any);
                setPackageDays(undefined);
                setPackagePeriodDays(undefined);
              }}
            />

            <Select
              label={<Trans>Loan period</Trans>}
              data={packageDaysOptions.map((d) => ({
                value: d.toString(),
                label: renderLoanPeriod(d),
              }))}
              value={packageDays?.toString()}
              onChange={(value) => {
                setPackageDays(+value!);
                setPackagePeriodDays(undefined);
              }}
            />

            <Select
              label={<Trans>Payment period</Trans>}
              data={loanPackage?.periodDaysOptions.map((d) => ({
                value: d.toString(),
                label: renderLoanPeriod(d),
              }))}
              value={packagePeriodDays?.toString()}
              onChange={(value) => {
                setPackagePeriodDays(+value!);
              }}
            />
          </SimpleGrid>

          {paymentPlanLoading && <Skeleton height={200} />}

          {paymentPeriods.length > 0 && (
            <InputWrapper label={<Trans>Payment periods</Trans>}>
              <Table withTableBorder striped withColumnBorders withRowBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Trans>Period</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Time</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Principal amount</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Remaining principal</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Interest</Trans>
                    </Table.Th>
                    <Table.Th ta="right">
                      <Trans>Payment amount</Trans>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {paymentPeriods.map((p, i) => {
                    return (
                      <Table.Tr key={i}>
                        <Table.Td>{p.period === 0 ? t`Fee` : p.period}</Table.Td>

                        <Table.Td>
                          {(function () {
                            if (p.period === 0) return "-";
                            if (!p.startTime || !p.endTime) return "-";
                            return (
                              <Fragment>
                                <DateFormat value={p.startTime} type="date" />
                                {" - "}
                                <DateFormat value={p.endTime} type="date" />
                              </Fragment>
                            );
                          })()}
                        </Table.Td>

                        <Table.Td>
                          <CurrencyFormat value={p.capitalAmount} />
                        </Table.Td>

                        <Table.Td>
                          <CurrencyFormat value={p.remainCapitalAmount || 0} />
                        </Table.Td>

                        <Table.Td>
                          <CurrencyFormat value={p.fee || 0} />
                        </Table.Td>

                        <Table.Td ta="right">
                          <CurrencyFormat value={p.totalAmount} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}

                  <Table.Tr>
                    <Table.Td colSpan={5} ta="left">
                      <Trans>Total</Trans>
                    </Table.Td>
                    <Table.Td fw={700} ta="right">
                      <CurrencyFormat
                        value={paymentPeriods.reduce((a, b) => a + b.totalAmount, 0)}
                      />
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </InputWrapper>
          )}

          {loanPackage && (
            <InputWrapper label={t`Loan package`}>
              <Card withBorder shadow="none" p={8} maw="100%" w={350}>
                <Stack gap={5}>
                  <Anchor fw={600}>{loanPackage.id}</Anchor>

                  <RowInfo
                    label={<Trans>Asset types</Trans>}
                    value={loanPackage.assetTypes.map((v) => t(loanAssetTypes[v].label)).join(", ")}
                  />

                  <RowInfo
                    label={<Trans>Loan package type</Trans>}
                    value={
                      <Badge color={loanPackageTypes[loanPackage.type].color}>
                        {t(loanPackageTypes[loanPackage.type].label)}
                      </Badge>
                    }
                  />

                  <RowInfo
                    label={<Trans>Loan period</Trans>}
                    value={
                      <Text ta="right">
                        <NumberFormat value={loanPackage.days / 30} /> <Trans>months</Trans>
                      </Text>
                    }
                  />
                  <RowInfo
                    label={<Trans>Contract fee</Trans>}
                    value={
                      <Text ta="right">
                        <CurrencyFormat value={loanPackage.contractFee} />
                      </Text>
                    }
                  />
                </Stack>
              </Card>
            </InputWrapper>
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
};

const RowInfo: FC<{
  label: ReactNode;
  value: string | ReactNode;
  valueProps?: TextProps;
}> = (props) => {
  return (
    <Group justify="space-between" wrap="nowrap" align="start">
      <Text fw={500} flex={1}>
        {props.label}
      </Text>
      {typeof props.value === "string" ? (
        <Text ta="right" flex={1} {...props.valueProps}>
          {props.value}
        </Text>
      ) : (
        props.value
      )}
    </Group>
  );
};
