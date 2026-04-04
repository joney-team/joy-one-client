"use client";

import { Avatar } from "@/components/avatar";
import { Calendar } from "@/components/calendar/calendar";
import { CalendarComponents } from "@/components/calendar/calendar-types";
import { normalizeCalendarView } from "@/components/calendar/calendar-utils";
import { SectionTitle } from "@/components/session-title";
import { AttendanceRecordStatus, EventType } from "@/graphql/enums.graphql";
import { useRouterQuery } from "@/hooks/use-router";
import { CalendarView } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { round } from "@/utils/number.utils";
import { useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Table, Text } from "@mantine/core";
import { IconTable } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FC, useMemo, useRef } from "react";
import { useEventsListener } from "../events/event-service";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import {
  getWorkingDurationTime,
  groupAttendanceRecordsByUsers,
  summaryAttendanceRecords,
} from "./attendance-utils";
import GetAttendanceRecordsDocument, {
  GetAttendanceRecordsQueryVariables,
} from "./graphql/getAttendanceRecords.graphql";
import { ModalAttendanceRecordsRef } from "./modals/modal-attendance-records";
import { PendingAttendanceList } from "./pending-attendance-list";

const ModalAttendanceRecords = dynamic(
  () => import("./modals/modal-attendance-records").then((mod) => mod.ModalAttendanceRecords),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface AttendanceListProps {
  date: string | null;
  view: string | null;
}

export const AttendanceList: FC<AttendanceListProps> = ({ date: queryDate, view: queryView }) => {
  const { workspaceSetting } = useWorkspaceSetting();
  const view = normalizeCalendarView(queryView);
  const { removeQueries, setQueries } = useRouterQuery();
  const modalAttendanceRecordsRef = useRef<ModalAttendanceRecordsRef>(null);

  const onChangeDate = (date: Date) => {
    const isThisMonth = DateTime.isSame(date, new Date(), "month");
    if (isThisMonth) {
      removeQueries(["date"], true);
    } else {
      setQueries(
        {
          date: (DateTime.toSeconds(date) + 60 * 60 * 24).toString(),
        },
        true,
      );
    }
  };

  const variables = useMemo<GetAttendanceRecordsQueryVariables>(() => {
    return {
      query: {
        timeRangeTime: `${view}-${DateTime.toSeconds(queryDate ?? new Date())}`,
        status: AttendanceRecordStatus.Approved,
      },
    };
  }, [queryDate, view]);

  const { data, refetch } = useQuery(GetAttendanceRecordsDocument, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  useEventsListener([EventType.AttendanceRecordApproved, EventType.AttendanceRecordNew], () =>
    refetch(),
  );

  const components = useMemo<CalendarComponents | undefined>(() => {
    if (!data || data.attendanceRecords.results.length === 0) return;

    return {
      monthDate: ({ date }) => {
        const memberRecords = groupAttendanceRecordsByUsers(
          data?.attendanceRecords.results.filter((record) => {
            return (
              DateTime.isSame(record.time, date, "day") &&
              record.status === AttendanceRecordStatus.Approved
            );
          }) ?? [],
        );

        if (memberRecords.length === 0) return null;

        return (
          <Stack>
            {memberRecords.map((memberRecord) => {
              return (
                <Card
                  key={memberRecord.member._id}
                  className="clickable"
                  component="button"
                  withBorder
                  py={4}
                  px="xs"
                  onClick={() =>
                    modalAttendanceRecordsRef.current?.open({
                      userId: memberRecord.member.userId,
                      date,
                    })
                  }
                >
                  <Group gap="xs">
                    <Avatar user={memberRecord.member} size={30} />
                    <Stack gap={0}>
                      <Text fz="xs" fw={500}>
                        {memberRecord.member.name}
                      </Text>
                      <Text fz="xs" ta="left">
                        {DateTime.toHHMM(getWorkingDurationTime(memberRecord.records))}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        );
      },
    };
  }, [data]);

  const summary = useMemo(() => {
    if (!data || !workspaceSetting) return null;

    return summaryAttendanceRecords({
      records: Array.from(data.attendanceRecords.results),
      workspaceSchedule: workspaceSetting.schedule,
    });
  }, [data, workspaceSetting]);

  return (
    <Stack p="sm">
      <Card shadow="xs" p="md">
        <Stack>
          <Calendar
            key={queryDate}
            initialDate={DateTime.normalizeDate(queryDate ?? new Date())}
            onChange={(range) => onChangeDate(range.start)}
            view={view}
            onViewChange={(v) => {
              if (v === CalendarView.MONTH) {
                removeQueries(["view"], true);
              } else {
                setQueries(
                  {
                    view: v,
                  },
                  true,
                );
              }
            }}
            components={components}
            head={<PendingAttendanceList />}
          />

          {summary && (
            <Stack gap="xs">
              <SectionTitle icon={IconTable} name={<Trans>Summary</Trans>} />

              <Table withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Trans>Member</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Total working days</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Total working time</Trans>
                    </Table.Th>
                    <Table.Th>
                      <Trans>Total shifts</Trans>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {summary.map((memberRecord) => {
                    const totalShifts = memberRecord.shifts.reduce(
                      (total, shift) => total + round(shift.workingSecs / shift.maxWorkingSecs, 1),
                      0,
                    );

                    return (
                      <Table.Tr key={memberRecord.member._id}>
                        <Table.Td>
                          <Group gap="xs">
                            <Avatar user={memberRecord.member} size={30} />
                            <Text fz="sm">{memberRecord.member.name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>{memberRecord.workingDates}</Table.Td>
                        <Table.Td>{DateTime.toHHMM(memberRecord.workingSecs)}</Table.Td>
                        <Table.Td>{totalShifts}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          )}
        </Stack>
      </Card>

      <ModalAttendanceRecords ref={modalAttendanceRecordsRef} />
    </Stack>
  );
};

export const AttendanceListPage: FC = () => {
  const search = useSearchParams();
  const date = search.get("date");
  const view = search.get("view");

  return <AttendanceList key={`${date}-${view}`} date={date} view={view} />;
};
