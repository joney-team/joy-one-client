import { WorkspaceScheduleInput } from './workspace-settings.types';

export function normalizeWorkspaceSchedule(
  input: WorkspaceScheduleInput | null | undefined,
): WorkspaceScheduleInput | null {
  if (!input) return null;

  const workingDaysSorted = input.workingDays
    .map((day) => {
      const [startHour, startMinute] = day.start.split(':').map(Number);

      const timeOrder = startHour * 60 + startMinute;

      return {
        ...day,
        _order: day.day + timeOrder,
      };
    })
    .sort((a, b) => a._order - b._order);

  return {
    timezone: input.timezone,
    workingDays: workingDaysSorted.map(({ _order, ...day }) => day),
  };
}
