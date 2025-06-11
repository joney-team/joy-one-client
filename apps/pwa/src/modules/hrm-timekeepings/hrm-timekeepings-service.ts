import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { IconClockCancel, IconClockCheck } from "@tabler/icons-react";
import { api } from "../apis";
import { HrmTimekeepingEntity, LocationTimekeepingDto, RejectTimekeepingDto, RequestTimekeepingDto } from "./hrm-timekeepings-types";

export async function getTimekeepings(query?: any) {
  return api.get<ResponseList<HrmTimekeepingEntity>>('/hrm/timekeepings', { params: query });
}

export async function captureLocationTimekeeping(dto: LocationTimekeepingDto) {
  return api.post<HrmTimekeepingEntity>('/hrm/timekeepings/location', dto);
}

export async function requestTimekeeping(dto: RequestTimekeepingDto) {
  return api.post<HrmTimekeepingEntity>('/hrm/timekeepings/request', dto);
}

export async function approveTimekeeping(id: string, silient?: boolean) {
  if (silient) {
    return api.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/approve`);
  }
  
  return onActionLoad({
    name: "Duyệt chấm công",
    icon: IconClockCheck,
    process: () => api.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/approve`),
  });
}

export async function rejectTimekeeping(id: string, dto: RejectTimekeepingDto) {
  return onActionLoad({
    name: "Từ chối chấm công",
    icon: IconClockCancel,
    color: 'orange',
    process: () => api.post<HrmTimekeepingEntity>(`/hrm/timekeepings/${id}/reject`, dto),
  });
}

export async function removeTimekeeping(id: string) {
  return onActionLoad({
    name: "Xóa chấm công",
    icon: IconClockCancel,
    color: 'red',
    process: () => api.delete(`/hrm/timekeepings/${id}`),
  })
}

export async function getPreviousTimeKeeping() {
  return api.get('/hrm/timekeepings/me/previous')
    .then((res) => res.timekeeping as HrmTimekeepingEntity | undefined)
}