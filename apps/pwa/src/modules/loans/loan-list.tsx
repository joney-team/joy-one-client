"use client";

import { Circle } from "@/components/circle";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { CustomerColumn } from "@/modules/customers/components/customer-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { WorkspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { LoanCard } from "@/modules/loans/components/loan-card";
import { Renderer } from "@/components/renderer";
import { OnModalCreateLoan } from "@/modules/loans/modals/modal-create-loan";
import { OnModalUpdateWorkspaceBranch } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { EventType } from "@/modules/events/event-types";
import { num, renderDate, t } from "@/modules/lang/lang-service";
import {
  archiveLoans,
  getLoans,
  loanPackageTypeColors,
  loanStatusColors,
  renderLoanPeriod,
} from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { ReportsContext, useReports } from "@/modules/reports/reports-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { round } from "@/utils/number.utils";
import { Anchor, Badge, Group, Progress, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBan,
  IconBrandSpeedtest,
  IconBuildingSkyscraper,
  IconCircle,
  IconCircleDashedMinus,
  IconClipboard,
  IconCoins,
  IconCreditCardPay,
  IconFileTypePdf,
  IconRefresh,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, Fragment } from "react";
import { useColor } from "../theme/use-color";
import { AppEntity } from "@/types";
import { OnModalPrompt } from "@/modals/modal-prompt";
import { StringUtils } from "@/utils/string.utils";
import { api } from "../apis";

interface LoanListProps {
  strictStatus?: LoanStatus[];
  counterColor?: string;
  count?: (report: ReportsContext) => number;
}

export const LoanList: FC<LoanListProps> = (props) => {
  const workspace = useWorkspace();
  const now = DateTimeUtils.timeToSeconds(DateTimeUtils.getStartEndOfDay(new Date()).end);
  const color = useColor();

  return (
    <List
      id={`loans-list-${(props.strictStatus || ["all"]).join("-")}`}
      name="loans"
      limit={16}
      icon={IconCreditCardPay}
      fetch={(p, controller) =>
        getLoans(
          {
            status: props.strictStatus ? props.strictStatus : p.status,
            ...p,
          },
          controller
        )
      }
      creatable={{
        onCreate: () => OnModalCreateLoan(),
        permission: WorkspacePermission.LOANS_CREATOR,
      }}
      columns={{
        code: CodeColumn({
          href: (value) => `/loans/${value}`,
          render: (_, data) => {
            const loan = data as LoanEntity;
            return (
              <Fragment>
                <Renderer visible={loan.isLiquidated}>
                  <Badge variant="light" color="violet" size="xs">
                    {t("liquidation")}
                  </Badge>
                </Renderer>

                <Renderer visible={loan.isHasLateInterestReceipt}>
                  <Badge variant="light" color="orange" size="xs">
                    {t("has_late_interest")}
                  </Badge>
                </Renderer>
              </Fragment>
            );
          },
        }),
        createdAt: DateTimeColumn({
          name: "createdAt",
          isSortable: true,
          isDefaultHide: true,
          isHasFilter: true,
        }),
        fulfilledAt: DateTimeColumn({
          name: "fulfilledAt",
          isSortable: true,
          isDefaultHide: true,
          isHasFilter: true,
          w: 200,
        }),
        workspaceBranchId: WorkspaceBranchColumn({ entity: AppEntity.LOANS }),
        customerId: CustomerColumn({ valuePath: "customer" }),
        packageId: {
          icon: IconCoins,
          name: "loan_package",
          filter: {
            staticSelector: {
              options: (workspace.settings.loanSettings?.loanPackages || []).map((s) => ({
                label: s.id.toString(),
                value: s.id,
              })),
            },
          },
          w: 350,
          render: ({ data: loan }) => {
            const loanPackage = loan.package;

            const linkContractPdf =
              loan.status !== LoanStatus.PENDING_SIGN &&
              !!workspace.settings.loanSettings?.contractPdfUrl
                ? workspace.settings.loanSettings?.contractPdfUrl?.replace("{code}", loan.code)
                : undefined;

            if (!loanPackage) return;

            return (
              <Stack gap={5} w="100%">
                <Group justify="space-between">
                  <Group gap={5}>
                    <Text fw={500}>{t(`loan_asset_type_${loan.assetType}`)}</Text>
                    <Badge
                      size="sm"
                      variant="light"
                      color={loanPackageTypeColors[loanPackage.type]}
                    >
                      {loanPackage.id}
                    </Badge>
                  </Group>
                  <Text ta="right">
                    {renderLoanPeriod(loan.packagePeriodDays)} /{" "}
                    {renderLoanPeriod(loan.package.days)}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text c="gray">{t(`money_amount`)}</Text>
                  <Text ta="right">{num(loan.amount, { type: "money" })}</Text>
                </Group>

                {(function () {
                  if (!loan.paymentPeriods) return null;
                  const startPeriod = loan.paymentPeriods.find((p) => p.period === 1);
                  const endPeriod = loan.paymentPeriods[loan.paymentPeriods.length - 1];

                  return (
                    <Group justify="space-between">
                      <Text c="gray">{t(`time`)}</Text>
                      <Text ta="right">
                        {renderDate(startPeriod?.endTime)} - {renderDate(endPeriod?.endTime)}
                      </Text>
                    </Group>
                  );
                })()}

                {linkContractPdf && (
                  <Group justify="space-between">
                    <Text c="gray">{t(`loan_contract`)}</Text>
                    <Anchor href={linkContractPdf} target="_blank" ta="right" fz={14}>
                      <Group gap={4} justify="right">
                        <IconFileTypePdf size={18} />
                        {t("open_file")}
                      </Group>
                    </Anchor>
                  </Group>
                )}
              </Stack>
            );
          },
          exportToExcel: (_, loan) => {
            return [
              { col: t("loan_package"), text: loan.package.id, width: 20 },
              {
                col: t("loan_asset_type"),
                text: t(`loan_asset_type_${loan.assetType}`),
                width: 20,
              },
              { col: t("loan_amount"), money: loan.amount, width: 30 },
            ];
          },
        },
        nextReceiptAt: {
          name: "loan_next_receipt_at",
          isSortable: true,
          render: ({ value, data: loan }) => {
            const warningReceiptBeforeDays =
              workspace.settings.loanSettings?.warningReceiptBeforeDays || 0;
            const isExpired =
              loan.nextReceiptAt && dayjs(loan.nextReceiptAt * 1000).isBefore(dayjs());
            const isWarning =
              warningReceiptBeforeDays > 0 &&
              loan.nextReceiptAt &&
              dayjs(loan.nextReceiptAt * 1000).isBefore(
                dayjs(now * 1000).add(warningReceiptBeforeDays + 1, "day")
              );

            const renderNextReceipt = () => {
              if (!loan.nextReceiptAt) return "--";
              const isToday = dayjs(loan.nextReceiptAt * 1000).isSame(dayjs(), "day");
              if (isToday) return t("today");
              return dayjs(loan.nextReceiptAt * 1000).from(now * 1000);
            };

            if (!value || loan.status === LoanStatus.COMPLETED) return "--";

            return (
              <Stack gap={3}>
                <Text c={isExpired ? "red" : isWarning ? "orange" : "var(--mantine-color-text)"}>
                  {renderDate(loan.nextReceiptAt)}
                </Text>
                <Text
                  fz={12}
                  c={isExpired ? "red" : isWarning ? "orange" : "var(--mantine-color-text)"}
                >
                  {renderNextReceipt()}
                </Text>
              </Stack>
            );
          },
          exportToExcel: false,
        },
        status: {
          w: 250,
          icon: IconCircle,
          filter: props.strictStatus
            ? undefined
            : {
                staticSelector: {
                  options: Object.values(LoanStatus).map((s) => ({
                    label: t(`loan_status_${s}`),
                    value: s,
                    activeColor: loanStatusColors[s],
                    render: () => {
                      const color = useColor();

                      return (
                        <Group gap={8}>
                          <Circle color={color(loanStatusColors[s])} size={8} />

                          <Text fz={14} fw={500}>
                            {t(`loan_status_${s}`)}
                          </Text>
                        </Group>
                      );
                    },
                  })),
                },
              },
          render: ({ data: loan }) => {
            const percent = loan.paymentProgress
              ? (loan.paymentProgress.filter((v) => v.isCompleted).length * 100) /
                loan.paymentProgress.length
              : 0;

            return (
              <Stack gap={10}>
                <Group wrap="nowrap" gap={3} miw={200}>
                  <Badge
                    variant="light"
                    style={{ borderRadius: 100 }}
                    color={loanStatusColors[loan.status]}
                  >
                    {t(`loan_status_${loan.status}`)}
                  </Badge>
                </Group>

                <Renderer
                  visible={[
                    LoanStatus.FULFILLED,
                    LoanStatus.COMPLETED,
                    LoanStatus.OVERDUE,
                  ].includes(loan.status)}
                >
                  <Tooltip label={`Tiến độ thanh toán ${round(percent, 1)}%`}>
                    <Group gap={4} wrap="nowrap">
                      {loan.paymentProgress?.map((r) => {
                        const isPaid = r.isCompleted;
                        const isExpired =
                          !isPaid && !!r.time && dayjs(r.time * 1000).isBefore(dayjs());
                        const isExpireToday =
                          !isPaid &&
                          !isPaid &&
                          !!r.time &&
                          dayjs(r.time * 1000).isSame(dayjs(), "day");

                        return (
                          <Progress
                            key={r.receiptId}
                            value={r.isCompleted || isExpired ? 100 : 0}
                            flex={1}
                            color={isExpireToday ? "orange" : isExpired ? "red" : color("primary")}
                            animated={isExpired || isExpireToday}
                          />
                        );
                      })}
                    </Group>
                  </Tooltip>
                </Renderer>
              </Stack>
            );
          },
          exportToExcel: false,
        },
      }}
      bulkActions={[
        {
          label: "move_workspace_branch",
          icon: IconBuildingSkyscraper,
          permission: WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH,
          handler: (data, ctx) =>
            OnModalUpdateWorkspaceBranch({
              entity: AppEntity.LOANS,
              ids: data.map((v) => v.id),
              onComplete: ctx.unSelect,
            }),
        },
        {
          label: "reject",
          icon: IconBan,
          permission: WorkspacePermission.LOANS_APPROVE,
          available: (data) => data.every((v) => [LoanStatus.PENDING].includes(v.status)),
          handler: (data, ctx) =>
            OnModalPrompt({
              title: StringUtils.capitalizeFirstLetter(`${t("reject")} ${t("loan")}`),
              message: t("enter_reject_reason"),
              onSubmit: async (reason) => {
                await api.post(`/loans/bulk-reject`, {
                  loanIds: data.map((v) => v.id),
                  reason,
                });
                ctx.unSelect();
              },
              icon: IconClipboard,
              color: "red",
              suggestions: [
                t("wrong_information"),
                t("info_does_not_match_img"),
                t("img_is_blurry"),
              ],
            }),
        },
        {
          label: "loan_revert_rejected",
          icon: IconRefresh,
          permission: WorkspacePermission.LOANS_APPROVE,
          available: (data) => data.every((v) => [LoanStatus.REJECTED].includes(v.status)),
          handler: async (data, ctx) => {
            await api.post(`/loans/bulk-revert-rejected`, {
              loanIds: data.map((v) => v.id),
            });
            ctx.unSelect();
          },
        },
        {
          permission: WorkspacePermission.LOANS_ARCHIVE,
          type: "archive",
          available: (data) =>
            data.every((v) => [LoanStatus.PENDING, LoanStatus.PENDING_SIGN].includes(v.status)),
          handler: (data) => archiveLoans(data.map((v) => v.id)),
        },
      ]}
      events={[
        EventType.LOANS_JUST_CREATED,
        EventType.LOANS_PENDING,
        EventType.LOANS_APPROVED,
        EventType.LOANS_REJECTED,
        EventType.LOANS_UPDATED,
        EventType.LOANS_FULFILLED,
        EventType.LOANS_COMPLETED,
        EventType.LOANS_ARCHIVED,
        EventType.LOANS_LIQUIDATION,
        EventType.LOANS_REVERT_LIQUIDATION,
        EventType.REPORT_RANGE_SYNCED,
        EventType.LOANS_SYNCED,
        EventType.LOANS_CHANGE_WORKSPACE_BRANCH,
        EventType.LOANS_APPROVED_REVERTED,
        EventType.LOANS_REVERT_REJECTED,
      ]}
      card={({ data: loan }) => <LoanCard loan={loan} />}
      filterModes={[
        {
          name: "liquidation",
          param: "isLiquidated",
          icon: IconBrandSpeedtest,
          params: () => ({ isLiquidated: true }),
          disabled: !!props.strictStatus,
        },
        {
          name: "has_late_interest",
          param: "isHasLateInterestReceipt",
          icon: IconCircleDashedMinus,
          params: () => ({ isHasLateInterestReceipt: true }),
          disabled: !!props.strictStatus,
        },
      ]}
    />
  );
};

export const LoanListCount: FC<LoanListProps> = (props) => {
  const color = useColor();
  const reports = useReports();
  const count = props.count?.(reports) || 0;

  if (count > 0)
    return (
      <Badge ml={8} size="xs" color={color(props.counterColor)}>
        {num(count)}
      </Badge>
    );

  return null;
};

export const renderLoanList = (props?: LoanListProps) => {
  return {
    list: () => <LoanList {...props} />,
    count: () => <LoanListCount {...props} />,
  };
};
