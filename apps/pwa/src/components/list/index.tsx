"use client";

import { Skeleton } from "@mantine/core";
import { BaseData, ListProps } from "./types";
import dynamic from "next/dynamic";

const ListCore = dynamic(() => import("./list-core").then((m) => m.ListCore), {
  ssr: false,
  loading: () => <Skeleton height={500} />,
});

export function List<T extends BaseData>(props: ListProps<T>) {
  return <ListCore {...(props as any)} />;
}
