import { AttendanceRecordStatus, AttendanceRecordType } from "@/graphql/enums.graphql";
import { type WorkspaceMemberFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { type AttendanceRecordFragment } from "./graphql/fragmentAttendanceRecord.graphql";
import { WorkspaceSettingFragment } from "../workspace-settings/graphql/fragmentWorkspaceSetting.graphql";
import { DateTime, RawDate } from "@joy-one-client/utils/date-time";
import { WorkingDayInterval } from "@/graphql/types.graphql";
import { getMinutesFromStringTime } from "@/components/time-slots/time-slots.utils";

function groupInPairs<
  T extends Pick<AttendanceRecordFragment, "time" | "userId" | "type" | "status">,
>(array: T[]): [T, T | null][] {
  const pairs: [T, T | null][] = [];
  let pendingCheckIn: T | null = null;

  for (const record of array) {
    if (record.type === AttendanceRecordType.CheckIn) {
      if (pendingCheckIn) {
        pairs.push([pendingCheckIn, null]);
      }

      pendingCheckIn = record;
      continue;
    }

    if (record.type === AttendanceRecordType.CheckOut && pendingCheckIn) {
      pairs.push([pendingCheckIn, record]);
      pendingCheckIn = null;
    }
  }

  if (pendingCheckIn) {
    pairs.push([pendingCheckIn, null]);
  }

  return pairs;
}

function groupRecordsByDate(records: AttendanceRecordFragment[]): {
  date: number;
  records: AttendanceRecordFragment[];
}[] {
  const dateMap = new Map<number, AttendanceRecordFragment[]>();

  records.forEach((record) => {
    const date = DateTime.normalizeDate(record.time);
    date.setHours(0, 0, 0, 0);

    const timestamp = DateTime.toSeconds(date);

    if (!dateMap.has(timestamp)) {
      dateMap.set(timestamp, []);
    }

    dateMap.get(timestamp)!.push(record);
  });

  return Array.from(dateMap.entries()).map(([date, records]) => ({
    date,
    records,
  }));
}

interface WorkingDayShiftMatching {
  workingDayInterval: WorkingDayInterval;
  workingSecs: number;
  maxWorkingSecs: number;
  lateSecs: number;
  earlySecs: number;
}

export function workingDayShiftsMatching(args: {
  startTime: RawDate;
  endTime: RawDate;
  workingDays: WorkingDayInterval[];
  // Grace period in minutes to consider a check-in as on time for the shift
  gracePeriodInMinutes: number;
}): WorkingDayShiftMatching[] {
  const timeWeekDay = DateTime.getDayOfWeek(args.startTime);
  const startOfDay = DateTime.getRange(args.startTime, "day").start;

  const shiftMatchings: WorkingDayShiftMatching[] = [];

  let pointedSecs: number | null = null;

  args.workingDays.forEach((shift) => {
    if (shift.day !== timeWeekDay) return;

    const shiftStartInMinutes = getMinutesFromStringTime(shift.start);
    const shiftEndInMinutes = getMinutesFromStringTime(shift.end);
    if (shiftStartInMinutes === null || shiftEndInMinutes === null) return false;

    const shiftStartTimeInSecs = DateTime.add(startOfDay, "minute", shiftStartInMinutes);
    const shiftEndTimeInSecs = DateTime.add(startOfDay, "minute", shiftEndInMinutes);

    const startTime = pointedSecs ?? args.startTime;

    const isReachedShiftStartTime = DateTime.isBefore(
      args.startTime,
      DateTime.add(shiftStartTimeInSecs, "minute", args.gracePeriodInMinutes),
      true,
    );

    if (!isReachedShiftStartTime) return;

    const maxWorkingSecs = (shiftEndInMinutes - shiftStartInMinutes) * 60;

    const workingSecs = Math.min(
      DateTime.toSeconds(args.endTime) - DateTime.toSeconds(startTime),
      maxWorkingSecs,
    );

    const lateSecs = pointedSecs
      ? 0
      : Math.max(0, DateTime.toSeconds(args.startTime) - DateTime.toSeconds(shiftStartTimeInSecs));

    const earlySecs = Math.max(
      0,
      DateTime.toSeconds(shiftStartTimeInSecs) - DateTime.toSeconds(args.startTime),
    );

    pointedSecs = DateTime.toSeconds(shiftEndTimeInSecs);

    if (workingSecs > 3600) {
      shiftMatchings.push({
        workingDayInterval: shift,
        workingSecs,
        maxWorkingSecs,
        lateSecs,
        earlySecs,
      });
    }
  });

  return shiftMatchings;
}

export function getWorkingDurationTime(
  records: Pick<AttendanceRecordFragment, "time" | "userId" | "type" | "status">[],
): number {
  const pendingCheckInsByUser = new Map<string, number[]>();

  return Array.from(records)
    .sort((a, b) => a.time - b.time)
    .filter((record) => record.status === AttendanceRecordStatus.Approved)
    .reduce((acc, record) => {
      const { userId } = record;

      if (record.type === AttendanceRecordType.CheckIn) {
        const pendingCheckIns = pendingCheckInsByUser.get(userId) ?? [];
        pendingCheckIns.push(record.time);
        pendingCheckInsByUser.set(userId, pendingCheckIns);
        return acc;
      }

      if (record.type === AttendanceRecordType.CheckOut) {
        const pendingCheckIns = pendingCheckInsByUser.get(userId);
        const checkInTime = pendingCheckIns?.shift();

        if (checkInTime !== undefined && record.time > checkInTime) {
          const duration = record.time - checkInTime;
          acc += duration;
        }
      }

      return acc;
    }, 0);
}

export function groupAttendanceRecordsByUsers(records: AttendanceRecordFragment[]): {
  member: WorkspaceMemberFragment;
  records: AttendanceRecordFragment[];
}[] {
  const memberMap = new Map<
    string,
    {
      member: WorkspaceMemberFragment;
      records: AttendanceRecordFragment[];
    }
  >();

  records.forEach((record) => {
    if (record.member) {
      const memberId = record.member._id;
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          member: record.member,
          records: [],
        });
      }
      memberMap.get(memberId)!.records.push(record);
    }
  });

  return Array.from(memberMap.values());
}

export enum SummaryAttendanceRecordStatusType {
  LATE = "late",
  EARLY = "early",
}

export interface SummaryAttendanceRecord {
  member: WorkspaceMemberFragment;
  records: AttendanceRecordFragment[];
  workingSecs: number;
  workingDates: number;
  shifts: {
    time: number;
    recordCheckInId: string;
    recordCheckOutId: string;
    shift: WorkingDayInterval;
    workingSecs: number;
    maxWorkingSecs: number;
    lateSecs: number;
    earlySecs: number;
  }[];
}

export function summaryAttendanceRecords(args: {
  records: AttendanceRecordFragment[];
  workspaceSchedule?: WorkspaceSettingFragment["schedule"];
}): SummaryAttendanceRecord[] {
  const groupedRecordsByUsers = groupAttendanceRecordsByUsers(
    args.records
      .filter((record) => record.status === AttendanceRecordStatus.Approved)
      .sort((a, b) => a.time - b.time),
  );

  const workspaceScheduleWorkkingDays = args.workspaceSchedule?.workingDays ?? [];

  return groupedRecordsByUsers.map(({ member, records: memberREcords }) => {
    const recordsByDate = groupRecordsByDate(memberREcords);
    const shifts: SummaryAttendanceRecord["shifts"] = [];

    const dateSummary = recordsByDate.reduce<
      Pick<SummaryAttendanceRecord, "workingDates" | "workingSecs">
    >(
      (acc, { records: recordsInDay }) => {
        const workingTimeDuration = getWorkingDurationTime(recordsInDay);

        if (workingTimeDuration > 0) {
          acc.workingDates += 1;
          acc.workingSecs += workingTimeDuration;
        }

        const pairwiseRecords = groupInPairs(recordsInDay);
        if (workspaceScheduleWorkkingDays.length > 0 && pairwiseRecords.length > 0) {
          pairwiseRecords.forEach((pairwiseRecord) => {
            if (pairwiseRecord[0] && pairwiseRecord[1]) {
              const shiftMatchings = workingDayShiftsMatching({
                startTime: pairwiseRecord[0].time,
                endTime: pairwiseRecord[1].time,
                workingDays: workspaceScheduleWorkkingDays,
                gracePeriodInMinutes: 30,
              });

              shiftMatchings.forEach(
                ({ workingDayInterval, workingSecs, lateSecs, earlySecs, maxWorkingSecs }) => {
                  if (pairwiseRecord[1]) {
                    shifts.push({
                      recordCheckInId: pairwiseRecord[0]._id,
                      recordCheckOutId: pairwiseRecord[1]._id,
                      shift: workingDayInterval,
                      time: pairwiseRecord[0].time,
                      workingSecs,
                      maxWorkingSecs,
                      lateSecs,
                      earlySecs,
                    });
                  }
                },
              );
            }
          });
        }

        return acc;
      },
      {
        workingDates: 0,
        workingSecs: 0,
      },
    );

    const summaryRecord: SummaryAttendanceRecord = {
      member,
      records: memberREcords,
      shifts,
      ...dateSummary,
    };
    return summaryRecord;
  });
}
