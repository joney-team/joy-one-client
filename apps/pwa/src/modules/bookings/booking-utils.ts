import { DateTimeUtils } from "@/utils/dateTime.utils";
import { getLocaleClient, t } from "../lang/lang-service";
import { BookingEntity } from "./booking-types";

export function getBookingDate(dateInSeconds: number, original?: boolean) {
  const _date = DateTimeUtils.secondsToTime(dateInSeconds);
  if (!_date) return '';

  const isToday = DateTimeUtils.isToday(_date);
  const isTomorrow = DateTimeUtils.isTomorrow(_date);
  const time = _date.toLocaleTimeString(getLocaleClient())
    .split(':')
    .map(v => v.padStart(2, '0'))
    .slice(0, 2)
    .join(':');

  const date = _date.toLocaleDateString(getLocaleClient())
    .split('/')
    .map(v => v.padStart(2, '0'))
    .join('/');

  if (!original && isToday) return `Hôm nay ${time} ${date}`;
  if (!original && isTomorrow) return `Ngày mai ${time} ${date}`;
  return `${time} ${date}`;
}

export function getBookingTitle(booking: Pick<BookingEntity, 'customer' | 'assigneeUsers' | 'title'>) {
  if (booking.title) return booking.title;

  const names = [];

  if (booking.customer) {
    names.push(booking.customer.name);
  }

  if (booking.assigneeUsers && booking.assigneeUsers.length > 0) {
    names.push(booking.assigneeUsers.map(v => v.name).join(', '));
  }

  if (names.length === 0) return '';
  return names.join(' - ');
}