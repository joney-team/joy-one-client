"use client";

import { useRouter } from "@/hooks/use-router";
import LangProvider from "@/modules/lang/lang-provider";
import dynamic from "next/dynamic";

const ErrorBoundary = dynamic(() => import("@/components/error-boundary"), { ssr: false });

export default function NotFound() {
  const router = useRouter();
  return (
    <LangProvider>
      <ErrorBoundary error={new Error("Page not found")} reset={() => router.replace("/")} />
    </LangProvider>
  );
}
