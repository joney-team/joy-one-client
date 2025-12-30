"use client";

import { Button } from "@/components/buttons/button";
import { SectionTitle } from "@/components/session-title";
import { getCustomer } from "@/modules/customers/customer-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { getClientLocale } from "@/modules/lang/lang-service";
import { loanPackageTypes } from "@/modules/loans/loans-constants";
import { getLoanByCode } from "@/modules/loans/loans-service";
import { LoanEntity, LoanPackageType, LoanReceiptData } from "@/modules/loans/loans-types";
import { getReceipts, isPartialPayment } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptStatus } from "@/modules/receipts/receipts-types";
import { getWorkspaceMemberByIds } from "@/modules/workspace-members/workspace-members-service";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { WidgetProps } from "@/widgets/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, Group, parseThemeColor, Stack, useMantineTheme } from "@mantine/core";
import { IconFileExcel, IconReportAnalytics } from "@tabler/icons-react";
import { FC } from "react";
import writeXlsxFile from "write-excel-file";
import { ReportWidgetsContext } from "../types";

interface CreditReportItem {
  time: number;
  type: LoanPackageType;
  loan: LoanEntity;
  cashier?: WorkspaceMemberInfo;
  customer?: CustomerEntity;
  receipt: ReceiptEntity;
  fee: {
    total: number;
    packageTypes: {
      [key in LoanPackageType]: number;
    };
  };
  capital: {
    total: number;
    packageTypes: {
      [key in LoanPackageType]: number;
    };
  };
  expense: {
    total: number;
    packageTypes: {
      [key in LoanPackageType]: number;
    };
  };
  advancePayment: number;
  isAvancedPayment: boolean;
  total: number;
}
interface CreditReport {
  items: CreditReportItem[];
  total: {
    fee: {
      total: number;
      packageTypes: {
        [key in LoanPackageType]: number;
      };
    };
    capital: {
      total: number;
      packageTypes: {
        [key in LoanPackageType]: number;
      };
    };
    expense: {
      total: number;
      packageTypes: {
        [key in LoanPackageType]: number;
      };
    };
    advancePayment: number;
    amount: number;
  };
}

const chunkingSize = 300;

const exportReport = async (receipts: ReceiptEntity[]): Promise<CreditReport> => {
  const reports: CreditReportItem[] = [];
  const customers: CustomerEntity[] = [];
  const loans: LoanEntity[] = [];

  const loanCodes = [...new Set([...receipts.map((v) => v.relatedLoanCode)])].filter(
    (v) => !!v
  ) as string[];

  for (const loanCode of loanCodes) {
    try {
      const loan = await getLoanByCode(loanCode);
      loans.push(loan);
    } catch (error) {
      const relatedreceipts = receipts.filter((v) => v.relatedLoanCode === loanCode);
      console.error(`Failed to load loan with code ${loanCode}`, relatedreceipts);
      throw error;
    }
  }

  const customerIds = [
    ...new Set(
      [...(receipts.map((v) => v.relatedCustomerId).filter(Boolean) || [])].filter(Boolean)
    ),
  ].filter(Boolean) as string[];

  for (const customerId of customerIds) {
    const customer = await getCustomer(customerId);
    customers.push(customer);
  }

  for (const receipt of receipts) {
    const loan = loans.find((v) => v.code === receipt.relatedLoanCode);
    const customer = customers.find((v) => v._id === receipt.relatedCustomerId);

    if (!loan || !customer) {
      console.log(`Receipt not available:`, receipt.relatedLoanCode, loan);
      continue;
    }

    const receiptData = receipt.data as LoanReceiptData;

    const isAvancedPayment = isPartialPayment(receipt);

    if (loan && customer) {
      const capital = Object.values(LoanPackageType).reduce(
        (acc, type) => {
          if (!isAvancedPayment && receiptData && loan.package.type === type) {
            if (receiptData.liquidation) {
              if (receiptData.liquidationCalculated) {
                acc[type] = receiptData.liquidationCalculated.remainCapitalAmount;
              } else {
                acc[type] = 0;
              }
            } else if (receiptData.period && receiptData.period.capitalAmount > 0) {
              acc[type] = receiptData.period.capitalAmount;
            }
          }

          return acc;
        },
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        }
      );

      const fee = Object.values(LoanPackageType).reduce(
        (acc, type) => {
          if (!isAvancedPayment && receiptData && loan.package.type === type) {
            acc[type] = receipt.amount - capital[type];
          }

          return acc;
        },
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        }
      );

      const expense = Object.values(LoanPackageType).reduce(
        (acc, type) => {
          if (!isAvancedPayment && loan.package.type === type) {
            if (receipt.amount < 0) acc[type] = receipt.amount;
          }

          return acc;
        },
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        }
      );

      const report: CreditReportItem = {
        time: receipt.paidAt,
        loan,
        type: loan.package.type,
        receipt,
        customer,
        cashier: receipt.cashierUser || receipt.disbursementUser,
        fee: {
          total: Object.values(fee).reduce((acc, value) => acc + value, 0),
          packageTypes: fee,
        },
        capital: {
          total: Object.values(capital).reduce((acc, value) => acc + value, 0),
          packageTypes: capital,
        },
        expense: {
          total: Object.values(expense).reduce((acc, value) => acc + value, 0),
          packageTypes: expense,
        },
        advancePayment: isAvancedPayment ? receipt.amount : 0,
        total: receipt.amount,
        isAvancedPayment,
      };

      reports.push(report);
    }
  }

  const total = {
    fee: {
      total: reports.reduce((acc, item) => acc + item.fee.total, 0),
      packageTypes: reports.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: acc[item.type] + item.fee.total,
        }),
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        } as { [key in LoanPackageType]: number }
      ),
    },
    capital: {
      total: reports.reduce((acc, item) => acc + item.capital.total, 0),
      packageTypes: reports.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: acc[item.type] + item.capital.total,
        }),
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        } as { [key in LoanPackageType]: number }
      ),
    },
    expense: {
      total: reports.reduce((acc, item) => acc + item.expense.total, 0),
      packageTypes: reports.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: acc[item.type] + item.expense.total,
        }),
        {
          FIXED_CAPITAL: 0,
          UNFIXED_CAPITAL: 0,
          INSTALLMENT: 0,
        } as { [key in LoanPackageType]: number }
      ),
    },
    advancePayment: reports.reduce(
      (acc, item) => acc + (item.isAvancedPayment ? item.receipt.amount : 0),
      0
    ),
    amount: reports.reduce((acc, item) => acc + item.total, 0),
  };

  return {
    items: reports,
    total,
  };
};

export const ReportCreditWidget: FC<WidgetProps<ReportWidgetsContext>> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const parsedPrimaryColor = parseThemeColor({
    color: workspace.userMember.workspace.appColor || "primary",
    theme,
  });
  const parsedRedColor = parseThemeColor({ color: "red", theme });

  const packageTypes = Object.values(LoanPackageType);

  const handleExportExcel = async () => {
    onActionLoad({
      name: <Trans>Export data</Trans>,
      process: async () => {
        try {
          let receipts: ReceiptEntity[] = [];
          let count = 0;

          const query = {
            status: [ReceiptStatus.PAID],
            rangePaidAt: `${props.ctx.fromTime}-${props.ctx.toTime}`,
            sortPaidAt: 1,
          };

          // Fetch count
          await getReceipts({ ...query, offset: 0, limit: chunkingSize }).then((result) => {
            count = result.count;
            receipts = result.data;
          });

          // Fetch chunking receipts
          const fetchReceipts = async () => {
            if (receipts.length === count) return;

            const result = await getReceipts({
              ...query,
              offset: receipts.length,
              limit: chunkingSize,
            });
            receipts = [
              ...receipts,
              ...result.data.filter((r) => receipts.every((e) => e.id !== r.id)),
            ];

            return fetchReceipts();
          };

          await fetchReceipts();

          const report = await exportReport(receipts);

          const userMemberInfos = await getWorkspaceMemberByIds(
            [...(report.items.map((v) => v.cashier!.userId).filter(Boolean) || [])].filter(Boolean)
          );

          const borderColor = "#dee2e6";
          const numberFormat = "#,##0";

          const generalStyle = {
            wrap: true,
          };

          const headStyle = {
            color: "#ffffff",
            backgroundColor: parsedPrimaryColor.value,
            fontWeight: "bold",
            borderColor,
            ...generalStyle,
          };

          const data: any[][] = report.items.map((item) => {
            const { receipt, customer, cashier } = item;

            const userMemberInfo = userMemberInfos.find((v) => v.userId === cashier?.userId);
            const userMemberInfoName = userMemberInfo?.name || "--";

            return [
              {
                value: DateTime.format(receipt.paidAt, {
                  locale: getClientLocale(),
                  dateStyle: "short",
                }),
                ...generalStyle,
              },
              {
                value: receipt.workspaceBranch?.name ?? t`Main office`,
                ...generalStyle,
              },
              {
                value: customer?.name || "--",
                ...generalStyle,
              },
              {
                value: userMemberInfoName,
                width: userMemberInfoName.length,
                ...generalStyle,
              },
              // Fee
              ...packageTypes.map((type) => {
                return {
                  value: item.fee.packageTypes[type],
                  type: Number,
                  format: numberFormat,
                };
              }),
              // Capital
              ...packageTypes.map((type) => {
                return {
                  value: item.capital.packageTypes[type],
                  type: Number,
                  format: numberFormat,
                };
              }),
              // Expense capital
              ...packageTypes.map((type) => {
                return {
                  value: item.expense.packageTypes[type],
                  type: Number,
                  format: numberFormat,
                };
              }),
              // Advance payment
              {
                value: item.advancePayment,
                align: "right",
                type: Number,
                format: numberFormat,
              },
              // Receipt
              {
                value: receipt.amount,
                align: "right",
                type: Number,
                format: numberFormat,
                color:
                  receipt.amount > 0
                    ? parsedPrimaryColor.value
                    : receipt.amount < 0
                    ? parsedRedColor.value
                    : undefined,
              },
            ];
          });

          const headers = [
            [
              {
                value: t`Time`,
                rowSpan: 2,
                ...headStyle,
              },
              {
                value: t`Branch`,
                rowSpan: 2,
                ...headStyle,
              },
              {
                value: t`Customer`,
                rowSpan: 2,
                ...headStyle,
              },
              {
                value: t`Member`,
                rowSpan: 2,
                ...headStyle,
              },
              {
                value: t`Interest income`,
                span: packageTypes.length,
                align: "center",
                ...headStyle,
              },
              ...new Array(packageTypes.length - 1).fill(null),
              {
                value: t`Principal income`,
                span: packageTypes.length,
                align: "center",
                ...headStyle,
              },
              ...new Array(packageTypes.length - 1).fill(null),
              {
                value: t`Principal expense`,
                span: packageTypes.length,
                align: "center",
                ...headStyle,
              },
              ...new Array(packageTypes.length - 1).fill(null),
              {
                value: t`Advance payment`,
                rowSpan: 2,
                ...headStyle,
                align: "right",
              },
              {
                value: t`Receipt`,
                rowSpan: 2,
                align: "right",
                ...headStyle,
              },
            ],
            [
              null,
              null,
              null,
              null,
              ...packageTypes.map((type) => {
                return {
                  value: loanPackageTypes[type].label(),
                  align: "center",
                  ...headStyle,
                };
              }),
              ...packageTypes.map((type) => {
                return {
                  value: loanPackageTypes[type].label(),
                  align: "center",
                  ...headStyle,
                };
              }),
              ...packageTypes.map((type) => {
                return {
                  value: loanPackageTypes[type].label(),
                  align: "center",
                  ...headStyle,
                };
              }),
              null,
              null,
            ],
          ];

          const totalRow = [
            {
              value: t`Total`,
              align: "right",
              span: 3,
              ...headStyle,
            },
            null,
            null,
            null,
            ...packageTypes.map((type) => {
              const _total = report.total.fee.packageTypes[type];

              return {
                value: _total,
                type: Number,
                format: numberFormat,
                ...headStyle,
                backgroundColor:
                  _total > 0
                    ? parsedPrimaryColor.value
                    : _total < 0
                    ? parsedRedColor.value
                    : parsedPrimaryColor.value,
              };
            }),
            ...packageTypes.map((type) => {
              const _total = report.total.capital.packageTypes[type];

              return {
                value: _total,
                type: Number,
                format: numberFormat,
                ...headStyle,
                backgroundColor:
                  _total > 0
                    ? parsedPrimaryColor.value
                    : _total < 0
                    ? parsedRedColor.value
                    : parsedPrimaryColor.value,
              };
            }),
            ...packageTypes.map((type) => {
              const _total = report.total.expense.packageTypes[type];

              return {
                value: _total,
                type: Number,
                format: numberFormat,
                ...headStyle,
                backgroundColor:
                  _total > 0
                    ? parsedPrimaryColor.value
                    : _total < 0
                    ? parsedRedColor.value
                    : parsedPrimaryColor.value,
              };
            }),
            {
              value: report.total.advancePayment,
              type: Number,
              format: numberFormat,
              ...headStyle,
              backgroundColor:
                report.total.advancePayment > 0
                  ? parsedPrimaryColor.value
                  : report.total.advancePayment < 0
                  ? parsedRedColor.value
                  : parsedPrimaryColor.value,
            },
            {
              ...headStyle,
              value: report.total.amount,
              type: Number,
              format: numberFormat,
              backgroundColor:
                report.total.amount > 0
                  ? parsedPrimaryColor.value
                  : report.total.amount < 0
                  ? parsedRedColor.value
                  : parsedPrimaryColor.value,
            },
          ];

          const buffer = await writeXlsxFile([...headers, ...data, totalRow], {
            stickyRowsCount: 2,
            stickyColumnsCount: 3,
            columns: [
              { width: 12 },
              { width: 22 },
              { width: 22 },
              ...packageTypes.map(() => ({ width: 15 })),
              ...packageTypes.map(() => ({ width: 15 })),
              ...packageTypes.map(() => ({ width: 15 })),
              { width: 15 },
              { width: 15 },
            ],
            fontSize: 13,
          });

          const startAt = receipts[0]?.paidAt;
          const endAt = receipts[receipts.length - 1]?.paidAt;

          const name = String.capitalizeFirstLetter(
            `${t`Reports`} ${t`Income expense`} ${t`From`} ${DateTime.format(startAt, {
              locale: getClientLocale(),
              dateStyle: "short",
            }).replace(/\//g, "-")} ${t`To`} ${DateTime.format(endAt, {
              locale: getClientLocale(),
              dateStyle: "short",
            }).replace(/\//g, "-")}`
          );
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${name}.xlsx`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          onError(error);
        }
      },
    });
  };

  return (
    <Card withBorder={false} shadow="xs" p={16} w="100%" h="100%">
      <Stack justify="center" h="100%">
        <SectionTitle
          name={<Trans>Report income and expenditure</Trans>}
          icon={IconReportAnalytics}
        >
          <Group justify="end" flex={1}>
            <Button leftIcon={IconFileExcel} onClick={handleExportExcel} fz={12}>
              <Trans>Export</Trans> Excel
            </Button>
          </Group>
        </SectionTitle>
      </Stack>
    </Card>
  );
};
