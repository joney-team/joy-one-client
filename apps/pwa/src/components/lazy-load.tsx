"use client";

import { nonLoading } from "@/utils/non-loading";
import { type MantineSpacing } from "@mantine/core";
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
  p?: MantineSpacing;
}

export const PageLazyLoad: FC = () => {
  return <LazyLoad p="md" />;
};

export const PageLoading: (loadingProps: DynamicOptionsLoadingProps) => JSX.Element = () => {
  return <LazyLoad p="md" />;
};

export const LazyLoad: FC<LazyLoadProps> = ({ p }) => {
  return (
    <Stack p={p}>
      <Skeleton height="50dvh" />
    </Stack>
  );
};
