import { t } from "@lingui/core/macro";
import { BookingStatus } from "./booking-types";

export const bookingStatuses: Record<BookingStatus, { label: () => string }> = {
  [BookingStatus.JUST_CREATED]: { label: () => t`Just created` },
  [BookingStatus.CHECK_IN]: { label: () => t`Check in` },
  [BookingStatus.IN_PROGRESS]: { label: () => t`In progress` },
  [BookingStatus.RESCHEDULED]: { label: () => t`Rescheduled` },
  [BookingStatus.COMPLETED]: { label: () => t`Completed` },
  [BookingStatus.CANCELLED]: { label: () => t`Cancelled` },
};
