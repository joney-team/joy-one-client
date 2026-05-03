"use client";

import { PageLoading } from "@/components/lazy-load";
import dynamic, { DynamicOptions, DynamicOptionsLoadingProps, Loader } from "next/dynamic";

export function renderPage<P>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  loading?: ((loadingProps: DynamicOptionsLoadingProps) => React.ReactNode) | undefined,
) {
  return dynamic<P>(dynamicOptions, {
    ssr: false,
    loading: loading ?? PageLoading,
  });
}
