import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { IconClockCancel, IconClockCheck } from "@tabler/icons-react";
import { MainRequest } from "../requests/main.request";
import { HrmTimekeepingEntity, LocationTimekeepingDto, RejectTimekeepingDto, RequestTimekeepingDto } from "./hrm-timekeepings-types";

export async function getTimekeepings(query?: any) {
  return MainRequest.get<ResponseList<HrmTimekeepingEntity>>('/hrm/timekeepings', query);
}

export async function captureLocationTimekeeping(dto: LocationTimekeepingDto) {
  return MainRequest.post<HrmTimekeepingEntity>('/hrm/timekeepings/location', dto);
}

export async function requestTimekeeping(dto: RequestTimekeepingDto) {
  return MainRequest.post<HrmTimekeepingEntity>('/hrm/timekeepings/request', dto);
}

export async function approveTimekeeping(id: string, silient?: boolean) {
  if (silient) {
    return MainRequest.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/approve`);
  }
  
  return onActionLoad({
    name: "Duyệt chấm công",
    icon: IconClockCheck,
    process: () => MainRequest.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/approve`),
  });
}

export async function rejectTimekeeping(id: string, dto: RejectTimekeepingDto) {
  return onActionLoad({
    name: "Từ chối chấm công",
    icon: IconClockCancel,
    color: 'orange',
    process: () => MainRequest.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/reject`, dto),
  });
}

export async function removeTimekeeping(id: string) {
  return onActionLoad({
    name: "Xóa chấm công",
    icon: IconClockCancel,
    color: 'red',
    process: () => MainRequest.delete(`/hrm/timekeepings/${id}`),
  })
}

export async function getPreviousTimeKeeping() {
  return MainRequest.get('/hrm/timekeepings/me/previous')
    .then((res) => res.timekeeping as HrmTimekeepingEntity | undefined)
}