"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { Hovered } from "@/components/hovered";
import { EventType, Period, ReportType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { useEventsListener } from "@/modules/events/event-service";
import { TimeSeriesReportFragment } from "@/modules/reports/graphql/fragmentTimeSeriesReport.graphql";
import GetTimeSeriesReportDocument from "@/modules/reports/graphql/getTimeSeriesReport.graphql";
import GetTimeSeriesReportsDocument from "@/modules/reports/graphql/getTimeSeriesReports.graphql";
import GetWorkspaceBranchesByIdsDocument from "@/modules/workspace-branches/graphql/getWorkspaceBranchesByIds.graphql";
import { WorkspaceBranchSelector } from "@/modules/workspace-branches/workspace-branch-selector";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { getDefaultWorkspaceView } from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client/react";
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
import { useSearchParams } from "next/navigation";
import { FC, useEffect, useMemo } from "react";
import { Avatar } from "../../components/avatar";
import { ButtonSelect } from "../../components/buttons/button-select";
import { Errored } from "../../components/errored";
import { Renderer } from "../../components/renderer";
import { Widgets } from "../widgets";
import { useReportWidgetModules } from "./modules";
import { ReportWidgetsContext } from "./types";

export const ReportWidgets: FC = () => {
  const workspace = useWorkspace();
  const client = useApolloClient();
  const { workspaceSetting, workspaceView, updateWorkspaceView, currency } = useWorkspaceSetting();

  const router = useRouter();
  const { reportWidgetModules } = useReportWidgetModules();
  const searchs = useSearchParams();

  const getQuery = (query: any, prev?: boolean) => {
    let _query = { ...query };

    const targetPeriod = (_query.period || Period.Month).toUpperCase();

    const period: Period =
      targetPeriod === Period.Year
        ? Period.Month
        : targetPeriod === Period.Month
          ? Period.Date
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

  const queryReport = useMemo(() => {
    return getQuery({
      date: searchs.get("date") ?? undefined,
      period: searchs.get("period") ?? undefined,
      userId: searchs.get("userId") ?? undefined,
      workspaceBranchIds: searchs.getAll("workspaceBranchIds") ?? undefined,
    });
  }, [searchs]);

  const [fetchReport, { data: reports, loading: isFetching, error }] = useLazyQuery(
    GetTimeSeriesReportsDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const onFetchReport = () => {
    fetchReport({
      variables: {
        input: {
          fromTime: queryReport.fromTime,
          toTime: queryReport.toTime,
          period: queryReport.period,
          userId: queryReport.userId,
          workspaceBranchIds: queryReport.workspaceBranchIds,
        },
      },
    });
  };

  useEffect(() => {
    onFetchReport();
  }, [queryReport]);

  useEventsListener(
    [EventType.ReportTimeSeriesSynced],
    (e) => {
      const _report = e.data as TimeSeriesReportFragment;
      if (
        _report.type === ReportType.TimeSeries &&
        reports?.list.results.some((v) => v._id === _report._id)
      ) {
        client.query({
          query: GetTimeSeriesReportDocument,
          variables: {
            reportId: _report._id,
          },
        });
      }
    },
    [reports?.list.results],
  );

  const [userMemberInfos, isUserMemberInfosReady, setUerMemberInfo] = useWorkspaceMembers(
    [queryReport.userId].filter(Boolean),
  );

  const { data: workspaceBranchesData, loading: isWorkspaceBranchesLoading } = useQuery(
    GetWorkspaceBranchesByIdsDocument,
    {
      variables: {
        ids: queryReport.workspaceBranchIds,
      },
      skip: !queryReport.workspaceBranchIds || queryReport.workspaceBranchIds.length === 0,
    },
  );

  const ctx: ReportWidgetsContext = {
    isInitialized: !!reports,
    isFetching,
    router,
    rangeReports: reports?.list.results ?? [],
    fromTime: queryReport.fromTime,
    toTime: queryReport.toTime,
    period: queryReport.period,
    workspace,
    workspaceSetting: workspaceSetting!,
    currency,
    workspaceBranchIds: queryReport.workspaceBranchIds,
  };

  const searchPeriod = searchs.get("period") || Period.Month;

  if (!workspaceSetting) return null;

  return (
    <Stack p="md">
      <Group gap={10}>
        <ButtonSelect
          icon={IconClock}
          value={searchs.get("period") || Period.Month}
          options={[
            {
              label: <Trans>Date</Trans>,
              icon: IconCalendar,
              value: Period.Date,
            },
            {
              label: <Trans>Month</Trans>,
              icon: IconCalendarMonth,
              value: Period.Month,
            },
            {
              label: <Trans>Year</Trans>,
              icon: IconCalendarEvent,
              value: Period.Year,
            },
          ]}
          onChange={(value) => {
            if (typeof value !== "string") return;
            router.setQuery("period", value, true);
          }}
          onClear={searchs.get("period") ? () => router.removeQuery("period", true) : undefined}
        />

        <ButtonSelect
          icon={IconClock}
          label={(function () {
            const date = DateTime.normalizeDate(queryReport.date ?? new Date());
            if (searchPeriod === Period.Month)
              return `${date.getMonth() + 1}/${date.getFullYear()}`;
            if (searchPeriod === Period.Year) return `${date.getFullYear()}`;
            if (searchPeriod === Period.Date) return <DateFormat value={date} type="date" />;
          })()}
          isActive
          onClear={searchs.get("date") ? () => router.removeQueries(["date"], true) : undefined}
          onClick={() =>
            OnModalDatePicker({
              period: searchPeriod,
              date: DateTime.normalizeDate(queryReport.date ?? new Date()),
              onSelected:
                searchPeriod === Period.Date
                  ? (date) => {
                      router.setQueries({ date: DateTime.toSeconds(date).toString() }, true);
                    }
                  : undefined,
              onRangeSelected:
                searchPeriod !== Period.Date
                  ? (range) => {
                      if (range && range[0]) {
                        router.setQueries({ date: DateTime.toSeconds(range[0]).toString() }, true);
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
              router.setQueries({ userId: user.userId }, true);
            }}
            optionRightSection={(user) => {
              const isSelected = queryReport.userId === user.userId;

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
                    const selectedUser = userMemberInfos.find(
                      (v) => v.userId === queryReport.userId,
                    );

                    return (
                      <Group
                        justify="space-between"
                        style={{ position: "relative" }}
                        ref={hover.ref}
                      >
                        <Button
                          onClick={ctx.toggle}
                          size="compact-sm"
                          color={queryReport.userId ? "primary" : "var(--mantine-color-dimmed)"}
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
                              router.removeQuery("userId", true);
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
              router.setQueries({ workspaceBranchIds: branch._id }, true);
            }}
            target={(ctx) => {
              return (
                <Hovered>
                  {(hover) => {
                    const workspaceBranch = [
                      ...(workspaceBranchesData?.branches ?? []),
                      { _id: "root", name: <Trans>Main office</Trans> },
                    ].find((v) => queryReport.workspaceBranchIds.includes(v._id));

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
                            queryReport.workspaceBranchIds.length > 0
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

                            {isWorkspaceBranchesLoading ? (
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
                              router.removeQuery("workspaceBranchIds", true);
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

      <Errored error={error} visible={!!error} />

      <Widgets
        id="reports"
        key={JSON.stringify(queryReport)}
        readonly={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        widgets={workspaceView.reportWidgets}
        defaultWidgets={getDefaultWorkspaceView(workspace.type).reportWidgets}
        modules={reportWidgetModules}
        context={ctx}
        onChange={(widgets) =>
          updateWorkspaceView({
            reportWidgets: widgets?.map((v) => ({
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
