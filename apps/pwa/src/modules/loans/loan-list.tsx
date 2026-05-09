"use client";

import { Badge } from "@/components/badge";
import { Circle } from "@/components/circle";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { Renderer } from "@/components/renderer";
import { EventType, LoanStatus } from "@/graphql/enums.graphql";
import { LoanPackageType } from "@/graphql/types.graphql";
import { OnModalPrompt } from "@/modals/modal-prompt";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { LoanCard } from "@/modules/loans/components/loan-card";
import { renderLoanPeriod } from "@/modules/loans/loans-service";
import { type ModalUpdateWorkspaceBranchRef } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { workspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Group, Progress, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBan,
  IconBrandSpeedtest,
  IconBuildingSkyscraper,
  IconCircle,
  IconCircleDashedMinus,
  IconClipboard,
  IconClock,
  IconCoins,
  IconCreditCardPay,
  IconEye,
  IconFileTypePdf,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, Fragment, useRef } from "react";
import { useLocations } from "../locations/locations-context";
import { UseReports, useReports } from "../reports/hooks/use-reports";
import { useColor } from "../theme/use-color";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import BulkArchiveLoansDocument from "./graphql/bulkArchiveLoans.graphql";
import BulkRejectLoansDocument from "./graphql/bulkRejectLoans.graphql";
import BulkRevertRejectedLoansDocument from "./graphql/bulkRevertRejectedLoans.graphql";
import { LoanFragment } from "./graphql/fragmentLoan.graphql";
import GetLoansDocument from "./graphql/getLoans.graphql";
import { loanAssetTypes, loanPackageTypes, loanStatuses } from "./loans-constants";
import { type ModalCreateLoanRef } from "./modals/modal-create-loan";
import { useLang } from "../lang/lang-context";

const ModalUpdateWorkspaceBranch = dynamic(
  () =>
    import("@/modules/workspace-branches/modals/modal-update-workspace-branch").then(
      (res) => res.ModalUpdateWorkspaceBranch,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCreateLoan = dynamic(
  () => import("@/modules/loans/modals/modal-create-loan").then((res) => res.ModalCreateLoan),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface LoanListProps {
  strictStatus?: LoanStatus[];
  counterColor?: string;
  count?: (report: UseReports) => number;
}

export const LoanList: FC<LoanListProps> = (props) => {
  const { t } = useLingui();
  const client = useApolloClient();
  const color = useColor();
  const location = useLocations();
  const modalCreateLoanRef = useRef<ModalCreateLoanRef>(null);
  const modalUpdateWorkspaceBranchRef = useRef<ModalUpdateWorkspaceBranchRef>(null);
  const lang = useLang();
  const { workspaceSetting } = useWorkspaceSetting();
  const [archiveLoans] = useMutation(BulkArchiveLoansDocument);

  return (
    <Fragment>
      <List<LoanFragment>
        id={`loans-list-${(props.strictStatus || ["all"]).join("-")}`}
        name={<Trans>Loans</Trans>}
        limit={16}
        icon={IconCreditCardPay}
        query={GetLoansDocument}
        fixedParams={
          props.strictStatus
            ? {
                status: props.strictStatus,
              }
            : undefined
        }
        creatable={{
          onCreate: () => modalCreateLoanRef.current?.open(),
          permission: WorkspacePermission.LOANS_CREATOR,
        }}
        columns={{
          code: codeColumn({
            href: (value) => `/loans/${value}`,
          }),
          customerId: customerColumn({ valuePath: "customer" }),
          workspaceBranchId: workspaceBranchColumn(),
          packageId: {
            icon: IconCoins,
            name: <Trans>Loan package</Trans>,
            filter: {
              staticSelector: {
                options: (workspaceSetting?.loanSettings?.loanPackages || []).map((s) => ({
                  label: s.id.toString(),
                  value: s.id,
                })),
              },
            },
            minWidth: 290,
            render: ({ data: loan }) => {
              const loanPackage = loan.package;

              const linkContractPdf =
                loan.status !== LoanStatus.PendingSign &&
                !!workspaceSetting?.loanSettings?.contractPdfUrl
                  ? workspaceSetting?.loanSettings?.contractPdfUrl?.replace("{code}", loan.code)
                  : undefined;

              if (!loanPackage) return;

              return (
                <Stack gap={3} w="100%">
                  <Group justify="space-between">
                    <Group gap={5}>
                      <Text fw={500}>{t(loanAssetTypes[loan.assetType].label)}</Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={loanPackageTypes[loanPackage.type as LoanPackageType].color}
                      >
                        {loanPackage.id}
                      </Badge>
                    </Group>
                    <Text ta="right" fz={13} fw={500}>
                      {renderLoanPeriod(loan.packagePeriodDays)}/
                      {renderLoanPeriod(loan.package.days)}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text c="gray" fz={13}>
                      <Trans>Money amount</Trans>
                    </Text>
                    <Text ta="right" fz={13} fw={500}>
                      <CurrencyFormat value={loan.amount} />
                    </Text>
                  </Group>

                  {(function () {
                    if (!loan.paymentPeriods) return null;
                    const startPeriod = loan.paymentPeriods.find((p) => p.period === 1);
                    const endPeriod = loan.paymentPeriods[loan.paymentPeriods.length - 1];

                    return (
                      <Group justify="space-between">
                        <Text c="gray" fz={13}>
                          <Trans>Time</Trans>
                        </Text>

                        {startPeriod?.endTime && endPeriod?.endTime && (
                          <Text ta="right" fz={13} fw={500}>
                            <DateFormat value={startPeriod.endTime} type="date" /> -{" "}
                            <DateFormat value={endPeriod.endTime} type="date" />
                          </Text>
                        )}
                      </Group>
                    );
                  })()}

                  {linkContractPdf && (
                    <Group justify="space-between">
                      <Text c="gray" fz={13}>
                        <Trans>Loan contract</Trans>
                      </Text>
                      <Anchor href={linkContractPdf} target="_blank" ta="right" fz={13} fw={500}>
                        <Group gap={4} justify="right">
                          <IconFileTypePdf size={15} />
                          <Trans>Open file</Trans>
                        </Group>
                      </Anchor>
                    </Group>
                  )}
                </Stack>
              );
            },
            exportToExcel: (_, loan) => {
              return [
                { col: t`CID Infos`, text: loan.metadata?.cidNumber?.toString() || "" },
                {
                  col: t`Location`,
                  text: location.renderVnLocation(loan.metadata?.cidVnLocation) || "-",
                },
                {
                  col: t`Previous address`,
                  text: location.renderVnLocation(loan.metadata?.cidLocation) || "-",
                },
                { col: t`Loan package`, text: loan.package.id, width: 20 },
                {
                  col: t`Loan asset type`,
                  text: t(loanAssetTypes[loan.assetType].label),
                  width: 20,
                },
                { col: t`Loan amount`, money: loan.amount, width: 30 },
              ];
            },
          },
          nextReceiptAt: {
            name: <Trans>Payment date</Trans>,
            defaultWidth: 150,
            icon: IconClock,
            sortable: true,
            render: ({ value, data: loan }) => {
              const warningReceiptBeforeDays =
                workspaceSetting?.loanSettings?.warningReceiptBeforeDays || 0;

              const isExpired =
                loan.nextReceiptAt && DateTime.isBefore(loan.nextReceiptAt, new Date());

              const isWarning =
                warningReceiptBeforeDays > 0 &&
                loan.nextReceiptAt &&
                DateTime.isBefore(
                  loan.nextReceiptAt,
                  DateTime.add(new Date(), "day", warningReceiptBeforeDays + 1),
                );

              const { end } = DateTime.getRange(new Date(), "day");
              const diff = DateTime.toSeconds(end) - DateTime.getNowInSeconds();

              if (!value || loan.status === LoanStatus.Completed || !loan.nextReceiptAt)
                return "--";

              return (
                <Stack gap={3}>
                  <Text c={isExpired ? "red" : isWarning ? "orange" : "var(--mantine-color-text)"}>
                    {loan.nextReceiptAt && <DateFormat value={loan.nextReceiptAt} type="date" />}
                  </Text>

                  <Text fz={10} c={isExpired ? "red" : isWarning ? "orange" : "gray"}>
                    {loan.nextReceiptAt && <RelativeTimeFormat value={loan.nextReceiptAt - diff} />}
                  </Text>
                </Stack>
              );
            },
            exportToExcel: (_, loan) => {
              const { end } = DateTime.getRange(new Date(), "day");
              const diff = DateTime.toSeconds(end) - DateTime.getNowInSeconds();
              const day = loan.nextReceiptAt
                ? Math.round((DateTime.getNowInSeconds() - (loan.nextReceiptAt - diff)) / 86400)
                : null;

              return [
                { col: t`Payment date`, date: loan.nextReceiptAt },
                {
                  col: t`Late payment`,
                  number: day,
                },
              ];
            },
          },
          status: {
            defaultWidth: 180,
            name: <Trans>Status</Trans>,
            icon: IconCircle,
            filter: {
              staticSelector: {
                options: Object.values(LoanStatus).map((s) => ({
                  label: t(loanStatuses[s].label),
                  value: s,
                  activeColor: loanStatuses[s].color,
                  render: () => {
                    const color = useColor();

                    return (
                      <Group gap={8}>
                        <Circle color={color(loanStatuses[s].color)} size={8} />

                        <Text fz={14} fw={500}>
                          {t(loanStatuses[s].label)}
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
                <Stack gap={10} flex={1}>
                  <Renderer visible={!!loan.isLiquidated}>
                    <Badge variant="light" color="violet" style={{ borderRadius: 100 }}>
                      <Trans>Liquidation</Trans>
                    </Badge>
                  </Renderer>

                  <Renderer visible={!!loan.isHasLateInterestReceipt}>
                    <Badge variant="light" color="orange" style={{ borderRadius: 100 }}>
                      <Trans>Has late interest</Trans>
                    </Badge>
                  </Renderer>

                  <Badge
                    variant="light"
                    style={{ borderRadius: 100 }}
                    color={loanStatuses[loan.status].color}
                  >
                    {t(loanStatuses[loan.status].label)}
                  </Badge>

                  <Renderer
                    visible={(
                      [
                        LoanStatus.Fulfilled,
                        LoanStatus.Completed,
                        LoanStatus.Overdue,
                      ] as LoanStatus[]
                    ).includes(loan.status)}
                  >
                    <Tooltip label={`${t`Payment progress`} ${Number(percent.toFixed(1))}%`}>
                      <Group gap={4} wrap="nowrap">
                        {loan.paymentProgress?.map((r) => {
                          const isPaid = r.isCompleted;

                          const isExpired =
                            !isPaid && !!r.time && DateTime.isBefore(r.time, new Date());

                          const isExpireToday =
                            !isPaid && !!r.time && DateTime.isSame(r.time, new Date(), "day");

                          return (
                            <Progress
                              key={r.receiptId}
                              value={r.isCompleted || isExpired ? 100 : 0}
                              flex={1}
                              color={
                                isExpireToday ? "orange" : isExpired ? "red" : color("primary")
                              }
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
          createdAt: dateTimeColumn({
            name: <Trans>Created at</Trans>,
            sortable: true,
            isHasFilter: true,
          }),
          fulfilledAt: dateTimeColumn({
            name: <Trans>Fulfilled at</Trans>,
            sortable: true,
            isHasFilter: true,
          }),
        }}
        actions={[
          {
            label: <Trans>Detail</Trans>,
            icon: IconEye,
            href: (data) => `/loans/${data.code}`,
          },
        ]}
        bulkActions={[
          {
            label: <Trans>Change branch</Trans>,
            icon: IconBuildingSkyscraper,
            permission: WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH,
            handler: (data, ctx) =>
              modalUpdateWorkspaceBranchRef.current?.open({
                entity: AppEntity.LOANS,
                ids: data.map((v) => v.id),
                onComplete: () => ctx.unSelect(),
              }),
          },
          {
            label: <Trans>Reject</Trans>,
            icon: IconBan,
            permission: WorkspacePermission.LOANS_APPROVE,
            available: (data) =>
              data.every((v) => ([LoanStatus.Pending] as LoanStatus[]).includes(v.status)),
            handler: (data, ctx) =>
              OnModalPrompt({
                title: <Trans>Reject</Trans>,
                message: <Trans>Enter reject reason</Trans>,
                onSubmit: async (reason) => {
                  await client.mutate({
                    mutation: BulkRejectLoansDocument,
                    variables: {
                      input: {
                        loanIds: data.map((v) => v.id),
                        reason,
                      },
                    },
                  });
                  ctx.unSelect();
                },
                icon: IconClipboard,
                color: "red",
                suggestions: [t`Wrong information`, t`Info does not match image`, t`Img is blurry`],
              }),
          },
          {
            label: <Trans>Loan revert rejected</Trans>,
            icon: IconRefresh,
            permission: WorkspacePermission.LOANS_APPROVE,
            available: (data) =>
              data.every((v) => ([LoanStatus.Rejected] as LoanStatus[]).includes(v.status)),
            handler: async (data, ctx) => {
              await client.mutate({
                mutation: BulkRevertRejectedLoansDocument,
                variables: {
                  loanIds: data.map((v) => v.id),
                },
              });
              ctx.unSelect();
            },
          },
          {
            permission: WorkspacePermission.LOANS_ARCHIVE,
            type: "archive",
            icon: IconTrash,
            label: <Trans>Archive</Trans>,
            available: (data) =>
              data.every((v) =>
                ([LoanStatus.Pending, LoanStatus.PendingSign] as LoanStatus[]).includes(v.status),
              ),
            handler: (data) =>
              archiveLoans({
                variables: {
                  input: {
                    loanIds: data.map((v) => v.id),
                  },
                },
              }),
          },
        ]}
        events={[
          EventType.LoansJustCreated,
          EventType.LoansPending,
          EventType.LoansApproved,
          EventType.LoansRejected,
          EventType.LoansUpdated,
          EventType.LoansFulfilled,
          EventType.LoansCompleted,
          EventType.LoansArchived,
          EventType.LoansLiquidation,
          EventType.LoansRevertLiquidation,
          EventType.LoansFulfilledReverted,
          EventType.LoansSynced,
          EventType.LoansChangeWorkspaceBranch,
          EventType.LoansApprovedReverted,
          EventType.LoansRevertRejected,
        ]}
        card={LoanCard}
        filterModes={[
          {
            name: <Trans>Liquidation</Trans>,
            param: "isLiquidated",
            icon: IconBrandSpeedtest,
            params: () => ({ isLiquidated: true }),
            disabled: !!props.strictStatus,
          },
          {
            name: <Trans>Has late interest</Trans>,
            param: "isHasLateInterestReceipt",
            icon: IconCircleDashedMinus,
            params: () => ({ isHasLateInterestReceipt: true }),
            disabled: !!props.strictStatus,
          },
        ]}
      />

      <ModalUpdateWorkspaceBranch ref={modalUpdateWorkspaceBranchRef} />
      <ModalCreateLoan ref={modalCreateLoanRef} />
    </Fragment>
  );
};

export const LoanListCount: FC<LoanListProps> = (props) => {
  const color = useColor();
  const reports = useReports();
  const count = props.count?.(reports) || 0;

  if (count > 0)
    return (
      <Badge ml={8} size="xs" color={color(props.counterColor)}>
        <NumberFormat value={count} />
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
