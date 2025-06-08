import { Button } from "@/components/buttons/button";
import { SessionTitle } from "@/components/session-title";
import { getCustomer } from "@/modules/customers/customer-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { renderDate, t } from "@/modules/lang/lang-service";
import { getLoanByCode } from "@/modules/loans/loans-service";
import { LoanEntity, LoanPackageType, LoanReceiptData } from "@/modules/loans/loans-types";
import { getReceipts, isPartialPayment } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptStatus } from "@/modules/receipts/receipts-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WidgetProps } from "@/widgets/types";
import { Card, Group, parseThemeColor, Stack, useMantineTheme } from "@mantine/core";
import { IconFileExcel, IconReportAnalytics } from "@tabler/icons-react";
import { FC } from "react";
import { ReportWidgetsContext } from "../types";
import { getWorkspaceMemberByIds } from "@/modules/workspace-members/workspace-members-service";
import writeXlsxFile from "write-excel-file";
import { StringUtils } from "@/utils/string.utils";
import { onError } from "@/utils/exceptions.utils";

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

const exportReport = async (receipts: ReceiptEntity[]): Promise<CreditReport> => {
  const reports: CreditReportItem[] = [];

  const loanCodes = [
    ...new Set([...(receipts.map((v) => v.relatedLoanCode).filter(Boolean) || [])].filter(Boolean)),
  ].filter(Boolean) as string[];

  const customerIds = [
    ...new Set([...(receipts.map((v) => v.relatedCustomerId).filter(Boolean) || [])].filter(Boolean)),
  ].filter(Boolean) as string[];

  const customers = await Promise.all(customerIds.map((v) => getCustomer(v)));
  const loans = await Promise.all(loanCodes.map((v) => getLoanByCode(v)));

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
    advancePayment: reports.reduce((acc, item) => acc + (item.isAvancedPayment ? item.receipt.amount : 0), 0),
    amount: reports.reduce((acc, item) => acc + item.total, 0),
  };

  return {
    items: reports,
    total,
  };
};

export const ReportCreditWidget: FC<WidgetProps<ReportWidgetsContext>> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const parsedPrimaryColor = parseThemeColor({ color: workspace.userMember.workspace.appColor || "primary", theme });
  const parsedRedColor = parseThemeColor({ color: "red", theme });

  const packageTypes = Object.values(LoanPackageType);

  const exportExcel = async () => {
    const receipts = await getReceipts({
      getAll: true,
      status: [ReceiptStatus.PAID],
      rangePaidAt: `${props.ctx.fromTime}-${props.ctx.toTime}`,
      sortPaidAt: 1,
    }).then((res) => res.data);

    const report = await exportReport(receipts);

    try {
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
            value: renderDate(receipt.paidAt * 1000),
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
              receipt.amount > 0 ? parsedPrimaryColor.value : receipt.amount < 0 ? parsedRedColor.value : undefined,
          },
        ];
      });

      const headers = [
        [
          {
            value: t("time"),
            rowSpan: 2,
            ...headStyle,
          },
          {
            value: t("customer"),
            rowSpan: 2,
            ...headStyle,
          },
          {
            value: t("member"),
            rowSpan: 2,
            ...headStyle,
          },
          {
            value: "Thu lãi",
            span: packageTypes.length,
            align: "center",
            ...headStyle,
          },
          ...new Array(packageTypes.length - 1).fill(null),
          {
            value: "Thu gốc",
            span: packageTypes.length,
            align: "center",
            ...headStyle,
          },
          ...new Array(packageTypes.length - 1).fill(null),
          {
            value: "Chi gốc",
            span: packageTypes.length,
            align: "center",
            ...headStyle,
          },
          ...new Array(packageTypes.length - 1).fill(null),
          {
            value: "Tạm ứng",
            rowSpan: 2,
            ...headStyle,
            align: "right",
          },
          {
            value: "Hoá đơn",
            rowSpan: 2,
            align: "right",
            ...headStyle,
          },
        ],
        [
          null,
          null,
          null,
          ...packageTypes.map((type) => {
            return {
              value: t(`loan_package_${type}`),
              align: "center",
              ...headStyle,
            };
          }),
          ...packageTypes.map((type) => {
            return {
              value: t(`loan_package_${type}`),
              align: "center",
              ...headStyle,
            };
          }),
          ...packageTypes.map((type) => {
            return {
              value: t(`loan_package_${type}`),
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
          value: t("total"),
          align: "right",
          span: 3,
          ...headStyle,
        },
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
              _total > 0 ? parsedPrimaryColor.value : _total < 0 ? parsedRedColor.value : parsedPrimaryColor.value,
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
              _total > 0 ? parsedPrimaryColor.value : _total < 0 ? parsedRedColor.value : parsedPrimaryColor.value,
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
              _total > 0 ? parsedPrimaryColor.value : _total < 0 ? parsedRedColor.value : parsedPrimaryColor.value,
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
        stickyColumnsCount: 2,
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

      const name = StringUtils.capitalizeFirstLetter(
        `${t("reports")} ${t("income_expense")} ${t("from")} ${renderDate(startAt).replace(/\//g, "-")} ${t(
          "to"
        )} ${renderDate(endAt).replace(/\//g, "-")}`
      );
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
  };

  return (
    <Card withBorder={false} shadow="xs" p={16} w="100%" h="100%">
      <Stack justify="center" h="100%">
        <SessionTitle name={t("credit_report_title")} icon={IconReportAnalytics}>
          <Group justify="end" flex={1}>
            <Button leftIcon={IconFileExcel} onClick={exportExcel} fz={12}>
              {t("export")} Excel
            </Button>
          </Group>
        </SessionTitle>
      </Stack>
    </Card>
  );
};
