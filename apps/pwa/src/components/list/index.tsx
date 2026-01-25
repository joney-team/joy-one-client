"use client";

import type { BaseData } from "@joy-one-client/utils/base-data";
import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import { ListProps } from "./types";

const ListCore = dynamic(() => import("./list-core").then((m) => m.ListCore), {
  ssr: false,
  loading: () => <Skeleton height={500} />,
});

export function List<Data extends BaseData>(props: ListProps<Data>) {
  return <ListCore {...(props as any)} />;
}
