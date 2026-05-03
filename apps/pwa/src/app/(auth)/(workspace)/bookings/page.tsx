"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/bookings/booking-list").then((mod) => mod.BookingList)
);
