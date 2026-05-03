"use client";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";

const MessageBoxesLayoutComponent = dynamic(
  () => import("@/modules/message-boxes/message-boxes-layout").then((m) => m.MessageBoxesLayout),
  { ssr: false, loading: nonLoading },
);

export default function MessageBoxesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MessageBoxesLayoutComponent />
      {children}
    </>
  );
}
