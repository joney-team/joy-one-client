"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/bookings/booking-list").then((mod) => mod.BookingList)
);
export default () => <Layout component={Content} />;
