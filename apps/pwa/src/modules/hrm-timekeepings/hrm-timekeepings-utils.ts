import { WorkspaceMemberWorkingTimeType } from "@/modules/workspace-members/workspace-members-types";
import { WorkSlot } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { sortWorkSlots } from "../workspace-settings/workspace-settings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingsRules,
  HrmTimekeepingType,
} from "./hrm-timekeepings-types";

export interface HrmCalculateTimekeepingsArgs {
  timekeepings: HrmTimekeepingEntity[];
  workSlots?: WorkSlot[] | undefined;
  rules?: HrmTimekeepingsRules;
  workTimeType?: WorkspaceMemberWorkingTimeType;
}

export interface HrmCalculateTimeLog {
  isMain?: boolean;
  workSlotGroupId: string;
  start: number;
  end: number;
  duration: number;
  startDeviation: number;
  endDeviation: number;
}

export interface HrmCalculateTimekeepingsResult {
  timeLogs: HrmCalculateTimeLog[];
  totalWorkingTime: number;
  lateTime: number;
  overTime: number;
}

export interface HrmCalculateTimekeepingsArgs {
  timekeepings: HrmTimekeepingEntity[];
  workSlots?: WorkSlot[] | undefined;
  rules?: HrmTimekeepingsRules;
  workTimeType?: WorkspaceMemberWorkingTimeType;
}

export interface HrmCalculateTimeLog {
  isMain?: boolean;
  workSlotGroupId: string;
  start: number;
  end: number;
  duration: number;
  startDeviation: number;
  endDeviation: number;
}

export interface HrmCalculateTimekeepingsResult {
  timeLogs: HrmCalculateTimeLog[];
  totalWorkingTime: number;
  lateTime: number;
  overTime: number;
}

function getDeviation(fixedTime: number, time: number) {
  if (fixedTime === time) return 0;
  const between = Math.abs(fixedTime - time);
  if (fixedTime > time) return -between;
  return between;
}

function getIntersect(
  fixedTime: { start: number; end: number },
  time: { start: number; end: number }
): {
  start: number;
  end: number;
  duration: number;
  startDeviation: number;
  endDeviation: number;
} | null {
  if (fixedTime.start >= time.end || fixedTime.end <= time.start) return null;

  const start = Math.max(fixedTime.start, time.start);
  const end = Math.min(fixedTime.end, time.end);
  const duration = end - start;

  const startDeviation = getDeviation(fixedTime.start, time.start);
  const endDeviation = getDeviation(fixedTime.end, time.end);

  return {
    start,
    end,
    duration,
    startDeviation,
    endDeviation,
  };
}

function rangeSlice(time: { start: number; end: number }, slice: { start: number; end: number }) {
  const remainTimes = [] as { start: number; end: number }[];

  if (time.start < slice.start) {
    remainTimes.push({ start: time.start, end: slice.start });
  }

  if (time.end > slice.end) {
    remainTimes.push({ start: slice.end, end: time.end });
  }

  return remainTimes;
}

export function calculateTimekeepings(
  args: HrmCalculateTimekeepingsArgs
): HrmCalculateTimekeepingsResult {
  const workTimeType = args.workTimeType || WorkspaceMemberWorkingTimeType.FULLTIME;
  const timekeepings = [...args.timekeepings].sort((a, b) => a.time - b.time);
  const workSlots = args.workSlots || [];

  let totalWorkingTime = 0;
  let lateTime = 0;
  let overTime = 0;
  let timeLogs: HrmCalculateTimeLog[] = [];

  // Group timekeepings by check in and check out (Nhóm các phiên chấm công theo cặp Check In và Check Out)
  const groupTimekeepings = timekeepings.reduce((out, item, index) => {
    if (out.find((v) => !!v.find((k) => k._id === item._id))) return out;
    const nextTimekeeping = timekeepings[index + 1];
    if (
      nextTimekeeping &&
      item.type === HrmTimekeepingType.CHECK_IN &&
      nextTimekeeping.type === HrmTimekeepingType.CHECK_OUT
    ) {
      out.push([item, nextTimekeeping]);
    }
    return out;
  }, [] as HrmTimekeepingEntity[][]);

  const isAbleToCalculate = groupTimekeepings.length >= 1;

  if (isAbleToCalculate) {
    if (workTimeType === WorkspaceMemberWorkingTimeType.FULLTIME && workSlots.length > 0) {
      // const date = DateTime.normalizeDate(timekeepings[0].time)
      //   .hour(0)
      //   .minute(0)
      //   .second(0);
      const date = new Date(DateTime.normalizeDate(timekeepings[0].time).setHours(0, 0, 0, 0));

      const _workSlots = sortWorkSlots(workSlots.filter((slot) => slot.dayWeek === date.getDay()));

      const userWorkSlots = [] as {
        workSlotId: string;
        workSlotGroupId: string;
        start: number;
        end: number;
        duration: number;
        startDeviation: number;
        endDeviation: number;
      }[];

      const groupOfWorkSlots: {
        [groupId: string]: {
          start: number;
          end: number;
          duration: number;
          slots: WorkSlot[];
        };
      } = new Array(3).fill(0).reduce((out, _, index) => {
        const groupId = index.toString();
        const slots = _workSlots.filter((slot) => (slot.groupId || "0") === groupId);

        if (slots.length > 0) {
          const start = DateTime.toSeconds(
            DateTime.add(
              DateTime.add(date, "hour", slots[0].startHour),
              "minute",
              slots[0].startMin
            )
          );

          const end = DateTime.toSeconds(
            DateTime.add(
              DateTime.add(date, "hour", slots[slots.length - 1].endHour),
              "minute",
              slots[slots.length - 1].endMin
            )
          );

          const duration = end - start;

          out[groupId] = {
            start,
            end,
            duration,
            slots,
          };
        }

        return out;
      }, {} as any);

      const mainGroupId = Object.keys(groupOfWorkSlots).reduce((out, groupId) => {
        const group = groupOfWorkSlots[groupId];
        const prevGroup = groupOfWorkSlots[(+groupId - 1).toString()];
        const groupDistanceStart = Math.abs(group.start - groupTimekeepings[0][0].time);
        const prevGroupDistanceStart = prevGroup
          ? Math.abs(prevGroup.start - groupTimekeepings[0][0].time)
          : 0;

        if (prevGroup && groupDistanceStart < prevGroupDistanceStart) return groupId;
        return out;
      }, "0");

      // Calculate time log each work slot group (Tính thời gian làm việc thuộc từng khung giờ làm việc)
      groupTimekeepings.map((timekeepings) => {
        let rangeTimes: { start: number; end: number }[] = [
          { start: timekeepings[0].time, end: timekeepings[1].time },
        ];

        Object.keys(groupOfWorkSlots).map((groupId) => {
          const group = groupOfWorkSlots[groupId];

          // TODO: Fix this
          if (+groupId >= +mainGroupId) {
            group.slots.map((slot) => {
              rangeTimes.map((range, index) => {
                const slotStart = DateTime.toSeconds(
                  DateTime.add(DateTime.add(date, "hour", slot.startHour), "minute", slot.startMin)
                );

                const slotEnd = DateTime.toSeconds(
                  DateTime.add(DateTime.add(date, "hour", slot.endHour), "minute", slot.endMin)
                );

                const interect = getIntersect(
                  {
                    start: slotStart,
                    end: slotEnd,
                  },
                  range
                );
                if (interect) {
                  let _ranges = rangeTimes.filter((_, i) => i !== index);
                  const remainRange = rangeSlice(range, interect).filter((r) => r.start >= slotEnd);

                  _ranges = [..._ranges, ...remainRange];
                  rangeTimes = _ranges;

                  userWorkSlots.push({
                    workSlotId: slot.id,
                    workSlotGroupId: slot.groupId || "0",
                    ...interect,
                  });
                }
              });
            });
          }
        });
      });

      // Calculate time logs = Tổng thời gian ở mỗi ca làm việc
      Object.keys(groupOfWorkSlots).map((groupId) => {
        const relatedUserWorkSlots = userWorkSlots.filter((v) => v.workSlotGroupId === groupId);
        const duration = relatedUserWorkSlots.reduce((out, slot) => out + slot.duration, 0);
        if (duration > 0) {
          timeLogs.push({
            workSlotGroupId: groupId,
            duration,
            start: relatedUserWorkSlots[0]?.start || 0,
            end: relatedUserWorkSlots[relatedUserWorkSlots.length - 1]?.end || 0,
            startDeviation: relatedUserWorkSlots[0]?.startDeviation || 0,
            endDeviation: relatedUserWorkSlots[relatedUserWorkSlots.length - 1]?.endDeviation || 0,
            isMain: groupId === mainGroupId,
          });
        }
      });

      // Main time log = Ca làm việc chính (Có thời gian làm việc nhiều nhất)
      const mainTimeLog = timeLogs.find((v) => v.workSlotGroupId === mainGroupId);

      // Calculate total working time, late time, over time (Tính tổng thời gian làm việc, thời gian đi muộn, thời gian làm thêm)
      if (mainTimeLog) {
        totalWorkingTime = mainTimeLog.duration;

        // Latetime
        lateTime = mainTimeLog.startDeviation > 0 ? Math.abs(mainTimeLog.startDeviation) : 0;
        if (
          lateTime > 0 &&
          args.rules?.acceptLatenessUpToMins &&
          lateTime <= args.rules.acceptLatenessUpToMins * 60
        ) {
          totalWorkingTime += lateTime;
        }

        // Overtime
        const _overtime = timeLogs.reduce((out, group) => {
          if (group.workSlotGroupId === mainGroupId) {
            if (group.endDeviation < 0) return out;
            return out + group.endDeviation;
          }

          return out + group.duration;
        }, 0);

        if (
          args.rules?.acceptOverTimeAtLeastMins &&
          _overtime >= args.rules.acceptOverTimeAtLeastMins * 60
        ) {
          overTime = _overtime;
        }
      }
    }

    if (workTimeType === WorkspaceMemberWorkingTimeType.FREELANCER) {
      groupTimekeepings.map((timekeepings) => {
        const start = timekeepings[0].time;
        const end = timekeepings[1].time;
        const duration = end - start;

        timeLogs.push({
          start,
          end,
          duration,
          startDeviation: 0,
          endDeviation: 0,
          workSlotGroupId: "0",
        });
      });

      totalWorkingTime = timeLogs.reduce((out, v) => out + v.duration, 0);
    }
  }

  return {
    timeLogs,
    totalWorkingTime,
    lateTime,
    overTime,
  };
}

export const workingTimeHours = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = remainingSeconds / 60;

  const workHours = hours + minutes / 60;
  return parseFloat(workHours.toFixed(2));
};
