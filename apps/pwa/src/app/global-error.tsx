"use client";

import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";

const ErrorBoundary = dynamic(() => import("@/components/error-boundary"), {
  ssr: false,
  loading: () => <Skeleton height={500} />,
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
