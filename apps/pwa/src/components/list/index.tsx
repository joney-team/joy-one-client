"use client";

import { Skeleton } from "@mantine/core";
import { Suspense } from "react";
import { ListCore as ListCore } from "./list-core";
import { BaseData, ListProps } from "./types";

export function List<T extends BaseData>(props: ListProps<T>) {
  return (
    <Suspense fallback={<Skeleton height={500} />}>
      <ListCore {...props} />
    </Suspense>
  );
}
