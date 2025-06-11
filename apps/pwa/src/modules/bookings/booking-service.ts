import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { setBookingReaded } from "@/modules/bookings/modals/modal-next-booking";
import { IconAnalyze, IconArrowsLeftRight, IconCheck, IconClock, IconSend, IconUserCheck, IconX } from "@tabler/icons-react";
import { BookingEntity, BookingStatus, CreateBookingDto, RescheduleBookingDto, UpdateBookingDto } from "./booking-types";
import { api } from "../apis";

export async function createBooking(dto: CreateBookingDto) {
  return api.post<BookingEntity>('/bookings', dto);
}

export async function updateBooking(bookingId: string, dto: UpdateBookingDto) {
  return api.put<BookingEntity>(`/bookings/${bookingId}`, dto);
}

export async function getBookings(params?: any): Promise<ResponseList<BookingEntity>> {
  return api.get('/bookings', { params });
}

export async function cancelBooking(bookingId: string, reason: string) {
  return api.post(`/bookings/${bookingId}/cancel`, { reason });
}

export async function rescheduleBooking(dto: RescheduleBookingDto) {
  return api.post(`/bookings/reschedule`, dto);
}

export async function completeBooking(bookingId: string) {
  return onActionLoad({
    process: async () => api.post(`/bookings/${bookingId}/complete`),
    icon: getBookingStatusIcon(BookingStatus.COMPLETED),
    color: getBookingStatusColor(BookingStatus.COMPLETED),
  });
}

export async function checkinBooking(bookingId: string) {
  return onActionLoad({
    process: async () => api.post(`/bookings/${bookingId}/check-in`),
    icon: getBookingStatusIcon(BookingStatus.CHECK_IN),
    color: getBookingStatusColor(BookingStatus.CHECK_IN),
  })
}

export async function inProgressBooking(bookingId: string) {
  setBookingReaded(bookingId);
  return onActionLoad({
    process: async () => api.post(`/bookings/${bookingId}/in-progress`),
    icon: getBookingStatusIcon(BookingStatus.IN_PROGRESS),
    color: getBookingStatusColor(BookingStatus.IN_PROGRESS),
  });
}

export async function triggerRemindBooking(bookingId: string) {
  return onActionLoad({
    process: async () => api.post(`/bookings/${bookingId}/trigger-remind`),
    icon: IconSend,
    color: "orange"
  })
}

export function getBookingStatusColor(status: BookingStatus) {
  return {
    [BookingStatus.JUST_CREATED]: 'primary',
    [BookingStatus.CHECK_IN]: 'primary',
    [BookingStatus.COMPLETED]: 'green',
    [BookingStatus.IN_PROGRESS]: 'orange',
    [BookingStatus.RESCHEDULED]: 'violet',
    [BookingStatus.CANCELLED]: 'red',
  }[status];
}

export function getBookingStatusIcon(status: BookingStatus) {
  return {
    [BookingStatus.JUST_CREATED]: IconClock,
    [BookingStatus.CHECK_IN]: IconUserCheck,
    [BookingStatus.COMPLETED]: IconCheck,
    [BookingStatus.IN_PROGRESS]: IconAnalyze,
    [BookingStatus.RESCHEDULED]: IconArrowsLeftRight,
    [BookingStatus.CANCELLED]: IconX,
  }[status]
}

export const bookingActiveStatus = [
  BookingStatus.JUST_CREATED,
  BookingStatus.CHECK_IN,
  BookingStatus.IN_PROGRESS,
]