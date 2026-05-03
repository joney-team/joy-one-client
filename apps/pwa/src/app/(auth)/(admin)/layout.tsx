"use client";

import { LayoutAdmin } from "@/layout/layout-admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LayoutAdmin>{children}</LayoutAdmin>;
}
