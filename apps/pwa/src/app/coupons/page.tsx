"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/coupons/coupon-list").then((mod) => mod.CouponList));
export default () => <Content />;
