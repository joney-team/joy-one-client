import { BookingEntity } from "./booking-types";

export function getBookingTitle(
  booking: Pick<BookingEntity, "customer" | "assigneeUsers" | "title">
) {
  if (booking.title) return booking.title;

  const names = [];

  if (booking.customer) {
    names.push(booking.customer.name);
  }

  if (booking.assigneeUsers && booking.assigneeUsers.length > 0) {
    names.push(booking.assigneeUsers.map((v) => v.name).join(", "));
  }

  if (names.length === 0) return "";
  return names.join(" - ");
}
