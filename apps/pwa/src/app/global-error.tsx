"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

const ErrorBoundary = dynamic(() => import("@/components/error-boundary"), { ssr: false });

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
