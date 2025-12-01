"use client";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";

const ErrorBoundary = dynamic(() => import("@/components/error-boundary"), {
  ssr: false,
  loading: nonLoading,
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorBoundary error={error} reset={reset} />
      </body>
    </html>
  );
}
