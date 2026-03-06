import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";

export function getDatesFromRange(from: any, to: any): Date[] {
  if (!from || !to) return [];

  const _from = new Date(from);
  const _to = new Date(to);
  const diff = _to.getTime() - _from.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const dates = [];

  for (let i = 0; i <= days; i++) {
    const temp = new Date(_from.getTime() + i * 24 * 60 * 60 * 1000);
    dates.push(new Date(temp.getFullYear(), temp.getMonth(), temp.getDate()));
  }

  return dates;
}

export function getWeeksFromRange(from: any, to: any, startOnMonday = false) {
  const _from = new Date(from);
  const _to = new Date(to);
  const weeks: { from: Date; to: Date; dates: Date[] }[] = [];

  let current = new Date(_from);
  let week = { from: new Date(current), to: new Date(current), dates: [] as Date[] };

  while (current <= _to) {
    week.dates.push(new Date(current));

    // Check if the current day is the end of the week
    const dayOfWeek = current.getDay();
    const isEndOfWeek = startOnMonday ? dayOfWeek === 0 : dayOfWeek === 6;

    if (isEndOfWeek) {
      week.to = new Date(current);
      weeks.push(week);

      // Start a new week
      current.setDate(current.getDate() + 1);
      week = { from: new Date(current), to: new Date(current), dates: [] };
    } else {
      current.setDate(current.getDate() + 1);
    }
  }

  // Add the last week if it has any dates
  if (week.dates.length > 0) {
    week.to = new Date(current);
    weeks.push(week);
  }

  return weeks;
}

/**
 * Generates a breakdown of dates, weeks, and months within a given date range
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @param startOfWeek - The day the week starts on (0 = Sunday, 1 = Monday, etc.). Default is 0.
 * @returns An object containing arrays of dates, weeks, and months within the range
 */
export function getDateRangeBreakdown(
  startDate: Date,
  endDate: Date,
  startOfWeek: number = 0
): {
  dates: Date[];
  weeks: { start: Date; end: Date; dates: number }[];
  months: { start: Date; end: Date; dates: number; weeks: number }[];
} {
  // Normalize dates to start of day to avoid time-related issues
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Generate all dates in the range
  const dates: Date[] = [];
  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate all weeks in the range
  const weeks: { start: Date; end: Date; dates: number }[] = [];
  let weekStart = new Date(start);

  // Adjust to the start of the week
  while (weekStart.getDay() !== startOfWeek) {
    weekStart.setDate(weekStart.getDate() - 1);
  }

  while (weekStart <= end) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Only include weeks that overlap with the date range
    if (weekEnd >= start) {
      const actualStart = new Date(Math.max(weekStart.getTime(), start.getTime()));
      const actualEnd = new Date(Math.min(weekEnd.getTime(), end.getTime()));

      // Calculate number of dates in this week within the range
      const datesInWeek =
        Math.floor((actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      weeks.push({
        start: actualStart,
        end: actualEnd,
        dates: datesInWeek,
      });
    }

    weekStart.setDate(weekStart.getDate() + 7);
  }

  // Generate all months in the range
  const months: { start: Date; end: Date; dates: number; weeks: number }[] = [];
  let monthStart = new Date(start.getFullYear(), start.getMonth(), 1);

  while (monthStart <= end) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const actualStart = new Date(Math.max(monthStart.getTime(), start.getTime()));
    const actualEnd = new Date(Math.min(monthEnd.getTime(), end.getTime()));

    // Calculate number of dates in this month within the range
    const datesInMonth =
      Math.floor((actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate number of weeks in this month within the range
    const weeksInMonth = weeks.filter((week) => {
      // A week belongs to this month if any part of it overlaps with the month
      return week.start <= actualEnd && week.end >= actualStart;
    }).length;

    months.push({
      start: actualStart,
      end: actualEnd,
      dates: datesInMonth,
      weeks: weeksInMonth,
    });

    monthStart.setMonth(monthStart.getMonth() + 1);
  }

  return { dates, weeks, months };
}
