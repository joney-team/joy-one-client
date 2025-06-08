"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/coupons/coupon-rules").then((mod) => mod.CouponRules));
export default () => <Content />;
