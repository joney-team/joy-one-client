import { WorkspaceScheduleInput } from 'src/workspace-settings/workspace-settings.types';
import { WorkingDayInterval } from '../app.generic-types';
import { normalizeWorkspaceSchedule } from 'src/workspace-settings/workspace-settings.utils';

type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ScheduleDay = {
  day: Day;
  start: string;
  end: string;
};

/**
 * Normalize working day intervals for all 7 days
 * If a day has no intervals, return full day range (00:00 - 23:59)
 */
export function normalizeWorkingDaysToScheduleDays(
  workingDayIntervals: WorkingDayInterval[],
): ScheduleDay[] {
  const FULL_DAY_START = '00:00';
  const FULL_DAY_END = '23:59';

  // Group intervals by day
  const map = new Map<Day, WorkingDayInterval[]>();

  for (const interval of workingDayIntervals) {
    if (!map.has(interval.day as Day)) {
      map.set(interval.day as Day, []);
    }
    map.get(interval.day as Day)!.push(interval);
  }

  const result: ScheduleDay[] = [];

  // Iterate through all days of week (1 -> 7)
  for (let day = 1 as Day; day <= 7; day++) {
    const intervals = map.get(day as Day);

    // If no working interval, return full day
    if (!intervals || intervals.length === 0) {
      result.push({
        day,
        start: FULL_DAY_START,
        end: FULL_DAY_END,
      });
      continue;
    }

    // Sort intervals by start time
    intervals.sort((a, b) => a.start.localeCompare(b.start));

    // Return each interval separately
    for (const i of intervals) {
      result.push({
        day,
        start: i.start,
        end: i.end,
      });
    }
  }

  return result;
}

export function getScheduleWorkingDay(args: {
  dayWeek: number;
  setting: WorkspaceScheduleInput | null | undefined;
}) {
  const { dayWeek, setting } = args;
  const scheduleDay = normalizeWorkspaceSchedule(setting);
  const workingDayIntervals = scheduleDay?.workingDays.filter(
    (d) => d.day === dayWeek,
  );
  if (!workingDayIntervals || workingDayIntervals.length === 0) {
    return {
      startTime: '00:00',
      endTime: '23:59',
    };
  }

  return {
    startTime: workingDayIntervals[0].start,
    endTime: workingDayIntervals[workingDayIntervals.length - 1].end,
  };
}
