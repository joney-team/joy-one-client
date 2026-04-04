import { getMinutesFromStringTime } from "@/components/time-slots/time-slots.utils";
import { WorkingDayInterval } from "@/graphql/types.graphql";
import { DateTime, RawDate } from "@joy-one-client/utils/date-time";

export const isInWorkingDayInterval = (
  date: RawDate,
  workingDayIntervals: WorkingDayInterval[],
) => {
  const dayOfWeek = DateTime.getDayOfWeek(date);
  const startOfDate = DateTime.getRange(date, "day").start;

  return workingDayIntervals.some((interval) => {
    const startMins = getMinutesFromStringTime(interval.start);
    const endMins = getMinutesFromStringTime(interval.end);
    if (!startMins || !endMins || dayOfWeek !== interval.day) return false;

    const from = DateTime.add(startOfDate, "minute", startMins);
    const to = DateTime.add(startOfDate, "minute", endMins);
    return DateTime.isBefore(from, date) && DateTime.isAfter(to, date);
  });
};
