import { Avatar } from "@/components/avatar";
import { Calendar } from "@/components/calendar/calendar";
import { CalendarComponents } from "@/components/calendar/calendar-types";
import { normalizeCalendarView } from "@/components/calendar/calendar-utils";
import { AttendanceRecordStatus, EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { CalendarView } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Card, Group, Stack, Text } from "@mantine/core";
import { useSearchParams } from "next/dist/client/components/navigation";
import dynamic from "next/dynamic";
import { FC, useMemo, useRef } from "react";
import { useVariablesQuery } from "../apollo/use-query";
import { useEventsListener } from "../events/event-service";
import { groupAttendanceRecordsByUsers, sumAttendanceRecords } from "./attendance-utils";
import QUERY_ATTENDANCE_RECORDS, {
  type AttendanceRecordsQueryVariables,
} from "./graphql/queryAttendanceRecords.graphql";
import { ModalAttendanceRecordsRef } from "./modals/modal-attendance-records";

const ModalAttendanceRecords = dynamic(
  () => import("./modals/modal-attendance-records").then((mod) => mod.ModalAttendanceRecords),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const AttendanceList: FC = () => {
  const searchs = useSearchParams();
  const queryDate = searchs.get("date");
  const view = normalizeCalendarView(searchs.get("view"));
  const { removeQueries, setQueries } = useRouter();
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

  const variables = useMemo<AttendanceRecordsQueryVariables>(() => {
    return {
      query: {
        timeRangeTime: `${view}-${DateTime.toSeconds(queryDate ?? new Date())}`,
        status: AttendanceRecordStatus.Approved,
      },
    };
  }, [queryDate, view]);

  const { data, refetch } = useVariablesQuery(QUERY_ATTENDANCE_RECORDS, variables);

  useEventsListener([EventType.AttendanceRecordApproved, EventType.AttendanceRecordNew], () =>
    refetch(),
  );

  const components = useMemo<CalendarComponents | undefined>(() => {
    if (!data || data.attendanceRecords.results.length === 0) return;

    return {
      monthDate: ({ date }) => {
        const memberRecords = groupAttendanceRecordsByUsers(
          data?.attendanceRecords.results.filter((record) => {
            return DateTime.isSame(record.time, date, "day");
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
                        {DateTime.toHHMM(sumAttendanceRecords(memberRecord.records))}
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

  return (
    <Stack p="sm">
      <Card shadow="xs" p="md">
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
        />
      </Card>

      <ModalAttendanceRecords ref={modalAttendanceRecordsRef} />
    </Stack>
  );
};
