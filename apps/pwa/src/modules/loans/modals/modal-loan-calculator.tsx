"use client";

import { NumberCurrencyFormatter } from "@/components/number-currency-formatter";
import { ModalTitle } from "@/components/modal-title";
import { onReconnected } from "@/modules/events/event-service";
import { renderDate, num, tl } from "@/modules/lang/lang-service";
import { useLoans } from "@/modules/loans/loans-context";
import {
  getLoanPaymentPlan,
  loanPackageTypeColors,
  renderLoanPeriod,
} from "@/modules/loans/loans-service";
import { LoanAssetType, LoanPaymentPlanResult } from "@/modules/loans/loans-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@/utils/date-time.utils";
import { String } from "@/utils/string.utils";
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
import { FC, Fragment, useEffect, useState } from "react";

export let OnModalLoanCalculator: () => any = () => {};

export const ModalLoanCalculator: FC = () => {
  const workspace = useWorkspace();
  const loans = useLoans();

  const [opened, { open, close }] = useDisclosure(false);
  const [paymentPlanResult, setPaymentPlanResult] = useState<LoanPaymentPlanResult>();
  const [calculating, setCalculating] = useState(false);

  const [amount, setAmount] = useState<any>(1 * 1e7);
  const [assetType, setAssetType] = useState<any>(LoanAssetType.MOTOBIKE_REGISTRATION);
  const [_packageDays, setPackageDays] = useState<any>(180);
  const [_packagePeriodDays, setPackagePeriodDays] = useState<any>(30);
  const [startTime, setStartTime] = useState(DateTime.timeToSeconds());

  OnModalLoanCalculator = () => {
    open();
  };

  const onClose = async () => {
    close();
  };

  const loanPackages = workspace.settings?.loanSettings?.loanPackages || [];

  const assetTypeOptions = loanPackages.reduce((output, p) => {
    return Array.from([...(new Set([...output, ...p.assetTypes]) as any)]);
  }, [] as LoanAssetType[]);

  const packageDaysOptions = loanPackages.reduce((output, p) => {
    if (assetType && p.assetTypes.includes(assetType)) {
      output = Array.from([...(new Set([...output, p.days]) as any)]);
    }

    return output;
  }, [] as number[]);
  const packageDays = packageDaysOptions.find((d) => d === _packageDays) || packageDaysOptions[0];

  const packagePeriodDaysOptions = loanPackages.reduce((output, p) => {
    if (assetType && p.assetTypes.includes(assetType) && packageDays && p.days === packageDays) {
      return p.periodDaysOptions;
    }
    return output;
  }, [] as number[]);
  const packagePeriodDays =
    packagePeriodDaysOptions.find((d) => d === _packagePeriodDays) || packagePeriodDaysOptions[0];

  const loanPackage = workspace.settings?.loanSettings?.loanPackages?.find(
    (p) => assetType && p.assetTypes.includes(assetType) && p.days === packageDays
  );
  const paymentPeriods =
    paymentPlanResult?.paymentPeriods?.find((v) => v.periodDays === packagePeriodDays)?.periods ||
    [];

  useEffect(() => {
    setPaymentPlanResult(undefined);

    if (amount && loanPackage && opened) {
      setCalculating(true);

      getLoanPaymentPlan({
        packageId: loanPackage.id,
        amount,
        startTime,
      })
        .then(setPaymentPlanResult)
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setCalculating(false));
    }
  }, [amount, loanPackage, startTime, opened]);

  onReconnected(() => {
    if (amount && loanPackage && opened) {
      setCalculating(true);

      getLoanPaymentPlan({
        packageId: loanPackage.id,
        amount,
        startTime,
      })
        .then(setPaymentPlanResult)
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setCalculating(false));
    }
  }, [amount, loanPackage, startTime, opened]);

  if (!loans.isInitialized || !loans.assetEstimations) return null;

  return (
    <Modal
      title={<ModalTitle title={tl("loan-calculator")} icon={IconCalculator} />}
      onClose={onClose}
      opened={opened}
      size={1000}
    >
      <Stack gap={16}>
        <Group>
          <NumberInput
            flex={1}
            label="Số tiền vay"
            placeholder="Nhập số tiền vay"
            hideControls
            value={amount}
            onChange={(value) => setAmount(+value)}
          />

          <DateTimePicker
            flex={1}
            label={tl("fulfilledAt")}
            value={startTime ? new Date(startTime * 1000) : null}
            onChange={(d) => setStartTime(DateTime.timeToSeconds(d))}
          />
        </Group>

        <SimpleGrid cols={{ md: 3 }}>
          <Select
            label="Loại tài sản"
            data={assetTypeOptions.map((type) => ({
              value: type,
              label: tl(`loan_asset_type_${type}`),
            }))}
            value={assetType}
            onChange={(e) => {
              setAssetType(e as any);
              setPackageDays(undefined);
              setPackagePeriodDays(undefined);
            }}
          />

          <Select
            label="Thời hạn vay"
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
            label="Kỳ hạn thanh toán"
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

        {calculating && <Skeleton height={200} />}

        {paymentPeriods.length > 0 && (
          <InputWrapper label="Các kỳ thanh toán">
            <Table withTableBorder striped withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kỳ</Table.Th>
                  <Table.Th>Thời gian</Table.Th>
                  <Table.Th>TT Tiền gốc</Table.Th>
                  <Table.Th>Gốc còn lại</Table.Th>
                  <Table.Th>Lãi</Table.Th>
                  <Table.Th ta="right">Số tiền thanh toán</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {paymentPeriods.map((p, i) => {
                  return (
                    <Table.Tr key={i}>
                      <Table.Td>{p.period === 0 ? `Thu phí` : p.period}</Table.Td>

                      <Table.Td>
                        {(function () {
                          if (p.period === 0) return "-";
                          return (
                            <Fragment>
                              {renderDate(p.startTime)} - {renderDate(p.endTime)}
                            </Fragment>
                          );
                        })()}
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter value={p.capitalAmount} />
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter value={p.remainCapitalAmount || 0} />
                      </Table.Td>

                      <Table.Td>
                        <NumberCurrencyFormatter value={p.fee || 0} />
                      </Table.Td>

                      <Table.Td ta="right">
                        <NumberCurrencyFormatter value={p.totalAmount} />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}

                <Table.Tr>
                  <Table.Td colSpan={5} ta="left">
                    Tổng
                  </Table.Td>
                  <Table.Td fw={700} ta="right">
                    {num(
                      paymentPeriods.reduce((a, b) => a + b.totalAmount, 0),
                      { type: "money" }
                    )}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </InputWrapper>
        )}

        {loanPackage && (
          <InputWrapper label="Gói vay">
            <Card withBorder shadow="none" p={8} maw="100%" w={350}>
              <Stack gap={5}>
                <Anchor fw={600}>{loanPackage.id}</Anchor>

                <RowInfo
                  label="Tài sản"
                  value={loanPackage.assetTypes
                    .map((v) =>
                      String.capitalizeFirstLetter(
                        `${tl(`loan_asset_type_${v}`)}`.replace("Đăng ký", "").trim()
                      )
                    )
                    .join(", ")}
                />

                <RowInfo
                  label="Loại"
                  value={
                    <Badge color={loanPackageTypeColors[loanPackage.type]}>
                      {tl(`loan_package_${loanPackage.type}`)}
                    </Badge>
                  }
                />

                <RowInfo label="Hạn vay" value={`${num(loanPackage.days / 30)} tháng`} />
                <RowInfo label="Phí (CPV)" value={num(loanPackage.contractFee)} />
              </Stack>
            </Card>
          </InputWrapper>
        )}
      </Stack>
    </Modal>
  );
};

const RowInfo: FC<{
  label: string;
  value: any;
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
