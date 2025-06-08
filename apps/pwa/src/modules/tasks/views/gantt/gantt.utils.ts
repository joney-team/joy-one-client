import { TaskEntity } from "@/modules/tasks/tasks-types";

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
  const weeks: { from: Date, to: Date, dates: Date[] }[] = [];

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

export function getRangeOfTasks(tasks: TaskEntity[]) {
  const startTask = tasks.reduce((out, task) => {
    if (!task.startDate) return out;
    if (!out || !out.startDate) return task;
    return task.startDate < out.startDate ? task : out;
  }, undefined as TaskEntity | undefined);

  const endTask = tasks.reduce((out, task) => {
    if (!task.dueDate) return out;
    if (!out || !out.dueDate) return task;
    return task.dueDate > out.dueDate ? task : out;
  }, undefined as TaskEntity | undefined);

  return {
    startTask,
    endTask,
    startDate: startTask && (startTask.startDate || startTask.dueDate) ? new Date((startTask.startDate! || startTask.dueDate!) * 1000) : undefined,
    dueDate: endTask && (endTask.startDate || endTask.dueDate) ? new Date((endTask.dueDate! || endTask.startDate!) * 1000) : undefined,
  }
}