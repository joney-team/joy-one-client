import { getMinutesFromStringTime } from "@/components/time-slots/time-slots.utils";
import { WorkingDayInterval } from "@/graphql/types.graphql";
import { WorkSlot } from "@/types";
import { DateTime, RawDate } from "@joy-one-client/utils/date-time";

export interface WorkDaySlot {
  dayWeek: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  slots: WorkSlot[];
}

// TODO: Workspace schedule migration
export function useWorkDaySlots(): WorkDaySlot[] {
  // const { workspaceSetting } = useWorkspaceSetting();

  // let workDaySlots: WorkDaySlot[] = new Array(7).fill(0).reduce((acc, _, curr) => {
  //   // TODO: Workspace schedule migration
  //   const relatedSlots = ([] as any).filter((v) => v.dayWeek === curr);
  //   const startSlot = relatedSlots.reduce((acc, curr) => {
  //     return acc.startHour < curr.startHour ? acc : curr;
  //   }, relatedSlots[0]);

  //   const endSlot = relatedSlots.reduce((acc, curr) => {
  //     return acc.endHour > curr.endHour ? acc : curr;
  //   }, relatedSlots[0]);

  //   if (startSlot && endSlot) {
  //     acc.push({
  //       dayWeek: startSlot.dayWeek,
  //       startHour: startSlot.startHour,
  //       startMin: startSlot.startMin,
  //       endHour: endSlot.endHour,
  //       endMin: endSlot.endMin,
  //       slots: relatedSlots,
  //     });
  //   }
  //   return acc;
  // }, [] as WorkDaySlot[]);

  // workDaySlots = workDaySlots.sort((a, b) => a.dayWeek - b.dayWeek);

  // if (auth.user?.settings.isStartOfWeekSunday) {
  //   workDaySlots = [
  //     ...workDaySlots.filter((v) => v.dayWeek !== 0),
  //     ...workDaySlots.filter((v) => v.dayWeek === 0),
  //   ];
  // }

  return [];
}

export const isInWorkSlot = (slot: Date, workSlots?: WorkSlot[]) => {
  if (!workSlots) return false;

  return workSlots.some((s) => {
    const from = DateTime.normalizeDate(new Date(slot).setHours(s.startHour, s.startMin, 0, 0));
    const to = DateTime.normalizeDate(new Date(slot).setHours(s.endHour, s.endMin, 0, 0));
    return DateTime.isBefore(from, slot) && DateTime.isAfter(to, slot);
  });
};

export const isInWorkingDayInterval = (
  date: RawDate,
  workingDayIntervals: WorkingDayInterval[]
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

export const calculateWorkSlotTimePoint = (workSlot: WorkSlot) => {
  return DateTime.normalizeDate(
    DateTime.add(new Date(), "day", workSlot.dayWeek).getTime() +
      workSlot.startHour * 3600 * 1000 +
      workSlot.startMin * 60 * 1000
  ).getTime();
};

export const sortWorkSlots = (workSlots: WorkSlot[]) => {
  return workSlots.sort((a, b) => calculateWorkSlotTimePoint(a) - calculateWorkSlotTimePoint(b));
};
