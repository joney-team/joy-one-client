import { WorkSlot } from "@/types";
import { useLang } from "@/modules/lang/lang-context";
import { MainRequest } from "@/modules/requests/main.request";
import { SetWorkspaceSettingsDto, WorkspaceSettingEntity } from "@/modules/workspace-settings/workspace-settings-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import dayjs from "dayjs";

export async function getWorkspaceSettings() {
  return MainRequest.get<WorkspaceSettingEntity>(`/workspace-settings`)
}

export async function setWorkspaceSettings(dto: SetWorkspaceSettingsDto) {
  return MainRequest.put<WorkspaceSettingEntity>(`/workspace-settings`, dto)
}

export interface WorkDaySlot {
  dayWeek: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  slots: WorkSlot[];
}

export function useWorkDaySlots() {
  const lang = useLang();
  const workspace = useWorkspace();

  let workDaySlots: WorkDaySlot[] = new Array(7).fill(0).reduce((acc, _, curr) => {
    const relatedSlots = workspace.settings.wSlots.filter(v => v.dayWeek === curr);
    const startSlot = relatedSlots.reduce((acc, curr) => {
      return acc.startHour < curr.startHour ? acc : curr;
    }, relatedSlots[0]);

    const endSlot = relatedSlots.reduce((acc, curr) => {
      return acc.endHour > curr.endHour ? acc : curr;
    }, relatedSlots[0]);

    if (startSlot && endSlot) {
      acc.push({
        dayWeek: startSlot.dayWeek,
        startHour: startSlot.startHour,
        startMin: startSlot.startMin,
        endHour: endSlot.endHour,
        endMin: endSlot.endMin,
        slots: relatedSlots,
      })
    }
    return acc;
  }, [] as WorkDaySlot[]);

  workDaySlots = workDaySlots.sort((a, b) => a.dayWeek - b.dayWeek);

  if (lang.weekStart === 1) {
    workDaySlots = [...workDaySlots.filter(v => v.dayWeek !== 0), ...workDaySlots.filter(v => v.dayWeek === 0)];
  }

  return workDaySlots;
}

export const isInWorkSlot = (slot: Date, workSlots?: WorkSlot[]) => {
  if (!workSlots) return false;

  return workSlots.some(s => {
    const from = dayjs(slot).hour(s.startHour).minute(s.startMin);
    const to = dayjs(slot).hour(s.endHour).minute(s.endMin);
    return from.isBefore(slot) && to.isAfter(slot) || from.isSame(slot);
  })
}

export const calWorkSlotTimePoint = (workSlot: WorkSlot) => {
  return dayjs().add(workSlot.dayWeek, 'day')
    .add(workSlot.startHour, 'hour')
    .add(workSlot.startMin, 'minute')
    .toDate()
    .getTime();
}

export const sortWorkSlots = (workSlots: WorkSlot[]) => {
  return workSlots.sort((a, b) => calWorkSlotTimePoint(a) - calWorkSlotTimePoint(b));
}