export function getBookingTitle(booking: {
  title?: string | null;
  customer?: {
    name?: string;
  } | null;
  assigneeUsers?:
    | {
        name?: string;
      }[]
    | null;
}) {
  if (booking.title) return booking.title ?? "";

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
