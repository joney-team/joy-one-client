"use client";

import { nonLoading } from "@/utils/non-loading";
import dynamic, { DynamicOptionsLoadingProps } from "next/dynamic";
import type { FC, JSX } from "react";

const Skeleton = dynamic(() => import("@mantine/core").then((mod) => mod.Skeleton), {
  ssr: false,
  loading: nonLoading,
});

const Stack = dynamic(() => import("@mantine/core").then((mod) => mod.Stack), {
  ssr: false,
  loading: nonLoading,
});

interface LazyLoadProps {
  p?: number;
}

export const PageLazyLoad: FC = () => {
  return <LazyLoad p={16} />;
};

export const PageLoading: (loadingProps: DynamicOptionsLoadingProps) => JSX.Element = () => {
  return <LazyLoad p={16} />;
};

export const LazyLoad: FC<LazyLoadProps> = ({ p }) => {
  return (
    <Stack p={p}>
      <Skeleton height="50dvh" />
    </Stack>
  );
};
