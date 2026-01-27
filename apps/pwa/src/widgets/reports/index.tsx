"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { Hovered } from "@/components/hovered";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { useEventsListener } from "@/modules/events/event-service";
import { ReportEntity } from "@/modules/reports/reports-entity";
import { exportPeriodReport } from "@/modules/reports/reports-services";
import { RangeReport, ReportType } from "@/modules/reports/reports-types";
import { useWorkspaceBranches } from "@/modules/workspace-branches/hooks/use-workspace-branches";
import { WorkspaceBranchSelector } from "@/modules/workspace-branches/workspace-branch-selector";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { getDefaultWorkspaceView } from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Period } from "@/types";
import { ObjectUtils } from "@/utils/object.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Group, Loader, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarMonth,
  IconClock,
  IconMinus,
  IconPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { FC } from "react";
import { Avatar } from "../../components/avatar";
import { ButtonSelect } from "../../components/buttons/button-select";
import { Errored } from "../../components/errored";
import { Renderer } from "../../components/renderer";
import { Widgets } from "../widgets";
import { useReportWidgetModules } from "./modules";
import { ReportWidgetsContext } from "./types";

export const ReportWidgets: FC = () => {
  const workspace = useWorkspace();
  const { workspaceSetting, workspaceView, updateWorkspaceView, currency } = useWorkspaceSetting();
  const router = useRouter();
  const { reportWidgetModules } = useReportWidgetModules();

  const getQuery = (query: any, prev?: boolean) => {
    let _query = { ...query };

    const targetPeriod = _query.period || Period.MONTH;

    const period: Period =
      targetPeriod === Period.YEAR
        ? Period.MONTH
        : targetPeriod === Period.MONTH
        ? Period.DATE
        : targetPeriod;

    const date = _query.date ? new Date(+_query.date * 1000) : new Date();
    const range = DateTime.getRange(date, targetPeriod);

    let fromTime = DateTime.toSeconds(range.start);
    let toTime = DateTime.toSeconds(range.end.getTime() > Date.now() ? Date.now() : range.end);

    if (prev) {
      const distance = toTime - fromTime;
      fromTime -= distance;
      toTime -= distance;
    }

    return {
      fromTime,
      toTime,
      date,
      period,
      userId: query.userId,
      workspaceBranchIds: (query.workspaceBranchIds || "").toString().split(",").filter(Boolean),
    };
  };

  const report = useList<ReportEntity<RangeReport>>({
    id: "reports",
    fetch: (q) => {
      const _query = getQuery(q);
      return exportPeriodReport(
        ObjectUtils.cleanObj({
          fromTime: _query.fromTime,
          toTime: _query.toTime,
          period: _query.period,
          userId: _query.userId,
          workspaceBranchIds:
            _query.workspaceBranchIds.length > 0 ? _query.workspaceBranchIds : undefined,
        }) as any
      );
    },
  });

  useEventsListener(
    [EventType.ReportRangeSynced],
    (e) => {
      const _report = e.data as ReportEntity<RangeReport>;
      if (_report.type === ReportType.RANGE && report.data.some((v) => v._id === _report._id)) {
        report.setData(report.data.map((v) => (v._id === _report._id ? _report : v)));
      }
    },
    [report.data]
  );

  const query = getQuery(report.params);
  const period = report.params.period || Period.MONTH;

  const [userMemberInfos, isUserMemberInfosReady, setUerMemberInfo] = useWorkspaceMembers(
    [query.userId].filter(Boolean)
  );
  const [workspaceBranches, isWorkspaceBranchesReady] = useWorkspaceBranches(
    query.workspaceBranchIds
  );

  const ctx: ReportWidgetsContext = {
    isInitialized: report.isInitialized,
    isFetching: report.isFetching,
    router,
    rangeReports: report.data.map((v) => v.data),
    fromTime: query.fromTime,
    toTime: query.toTime,
    period,
    workspace,
    workspaceSetting: workspaceSetting!,
    currency,
  };

  if (!workspaceSetting) return null;

  return (
    <Stack p={16}>
      <Group gap={10}>
        <ButtonSelect
          icon={IconClock}
          value={period}
          options={[
            {
              label: <Trans>Date</Trans>,
              icon: IconCalendar,
              value: Period.DATE,
            },
            {
              label: <Trans>Month</Trans>,
              icon: IconCalendarMonth,
              value: Period.MONTH,
            },
            {
              label: <Trans>Year</Trans>,
              icon: IconCalendarEvent,
              value: Period.YEAR,
            },
          ]}
          onChange={(value) => {
            report.setParams({ period: value }, { isSilient: false });
          }}
          onClear={
            Object.keys(report.params)
              ? undefined
              : () => report.removeParams(["period"], { isSilient: false })
          }
        />

        <ButtonSelect
          icon={IconClock}
          label={(function () {
            const date = report.params.date ? new Date(+report.params.date * 1000) : new Date();
            if (period === Period.MONTH) return `${date.getMonth() + 1}/${date.getFullYear()}`;
            if (period === Period.YEAR) return `${date.getFullYear()}`;
            if (period === Period.DATE) return <DateFormat value={date} type="date" />;
          })()}
          isActive
          onClear={() => report.removeParams(["date"], { isSilient: false })}
          onClick={() =>
            OnModalDatePicker({
              period,
              date: report.params.date ? new Date(+report.params.date * 1000) : new Date(),
              onSelected:
                period === Period.DATE
                  ? (date) => {
                      report.setParams({ date: DateTime.toSeconds(date) });
                    }
                  : undefined,
              onRangeSelected:
                period !== Period.DATE
                  ? (range) => {
                      if (range && range[0]) {
                        report.setParams({ date: DateTime.toSeconds(range[0]) });
                      }
                    }
                  : undefined,
            })
          }
        />

        <Renderer visible={workspace.hasPermission(WorkspacePermission.REPORTS_VIEW)}>
          <WorkspaceMemberSelector
            onSelect={(user) => {
              if (!user) return;
              setUerMemberInfo(user as any);
              report.setParams({ userId: user.userId });
            }}
            optionRightSection={(user) => {
              const isSelected = query.userId === user.userId;

              return (
                <Group>
                  <ThemeIcon
                    radius={100}
                    variant="transparent"
                    color="var(--mantine-color-dimmed)"
                    size="sm"
                  >
                    {isSelected ? <IconMinus size={16} /> : <IconPlus size={16} />}
                  </ThemeIcon>
                </Group>
              );
            }}
            target={(ctx) => {
              return (
                <Hovered>
                  {(hover) => {
                    const selectedUser = userMemberInfos.find((v) => v.userId === query.userId);

                    return (
                      <Group
                        justify="space-between"
                        style={{ position: "relative" }}
                        ref={hover.ref}
                      >
                        <Button
                          onClick={ctx.toggle}
                          size="compact-sm"
                          color={query.userId ? "primary" : "var(--mantine-color-dimmed)"}
                          variant="outline"
                          radius={100}
                          leftIcon={IconUsers}
                        >
                          <Group gap={5}>
                            <Text fz={12} fw={500}>
                              <Trans>Members</Trans>
                            </Text>

                            {!isUserMemberInfosReady ? (
                              <Loader size={13} type="dots" color="var(--mantine-color-dimmed)" />
                            ) : (
                              selectedUser && (
                                <Group gap={5} mr={0}>
                                  <Group>
                                    <Tooltip label={selectedUser.name}>
                                      <Avatar withBorder user={selectedUser} size={22} />
                                    </Tooltip>
                                  </Group>
                                </Group>
                              )
                            )}
                          </Group>
                        </Button>

                        {selectedUser && hover.hovered && (
                          <ThemeIcon
                            color="dark.2"
                            radius={100}
                            size={16}
                            style={{
                              position: "absolute",
                              right: -5,
                              top: -5,
                              border: `1px solid white`,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              report.removeParams(["userId"]);
                            }}
                          >
                            <IconX size={7} strokeWidth={4} />
                          </ThemeIcon>
                        )}
                      </Group>
                    );
                  }}
                </Hovered>
              );
            }}
          />
        </Renderer>

        {workspace.isShouldEnableBranches && (
          <WorkspaceBranchSelector
            isShowRoot
            onSelect={(branch) => {
              if (!branch) return;
              report.setParams({ workspaceBranchIds: branch._id });
            }}
            target={(ctx) => {
              return (
                <Hovered>
                  {(hover) => {
                    const workspaceBranch = [
                      ...workspaceBranches,
                      { _id: "root", name: <Trans>Main office</Trans> },
                    ].find((v) => query.workspaceBranchIds.includes(v._id));

                    return (
                      <Group
                        justify="space-between"
                        style={{ position: "relative" }}
                        ref={hover.ref}
                      >
                        <Button
                          onClick={ctx.toggle}
                          size="compact-sm"
                          color={
                            query.workspaceBranchIds.length > 0
                              ? "primary"
                              : "var(--mantine-color-dimmed)"
                          }
                          variant="outline"
                          radius={100}
                          leftIcon={IconBuildingSkyscraper}
                        >
                          <Group gap={5}>
                            <Text fz={12} fw={500}>
                              <Trans>Branch</Trans>
                            </Text>

                            {!isWorkspaceBranchesReady ? (
                              <Loader size={13} type="dots" color="var(--mantine-color-dimmed)" />
                            ) : (
                              workspaceBranch && (
                                <Group gap={5} mr={0}>
                                  <Text fz={12} fw={700}>
                                    {workspaceBranch.name}
                                  </Text>
                                </Group>
                              )
                            )}
                          </Group>
                        </Button>

                        {workspaceBranch && hover.hovered && (
                          <ThemeIcon
                            color="dark.2"
                            radius={100}
                            size={16}
                            style={{
                              position: "absolute",
                              right: -5,
                              top: -5,
                              border: `1px solid white`,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              report.removeParams(["workspaceBranchIds"]);
                            }}
                          >
                            <IconX size={7} strokeWidth={4} />
                          </ThemeIcon>
                        )}
                      </Group>
                    );
                  }}
                </Hovered>
              );
            }}
          />
        )}
      </Group>

      <Errored error={report.error} visible={report.isHasError} />

      <Widgets
        id="reports"
        key={JSON.stringify(report.params)}
        readonly={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        widgets={workspaceView.reportWidgets}
        defaultWidgets={getDefaultWorkspaceView(workspace.type).reportWidgets}
        modules={reportWidgetModules}
        context={ctx}
        onChange={(widgets) =>
          updateWorkspaceView({
            reportWidgets: (widgets ?? []).map((v) => ({
              __typename: "DisplayWidget",
              ...v,
              state: v.state ?? {},
            })),
          })
        }
      />
    </Stack>
  );
};
